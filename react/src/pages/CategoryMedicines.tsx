import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesService } from '../services/categories';
import { medicinesService } from '../services/medicines';
import { notificationService } from '../services/notification';
import { useAuthStore } from '../services/auth';
import { Category, Medicine } from '../models/types';

const CategoryMedicines: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (id) {
      loadCategory(id);
      loadMedicines(id);
    }
  }, [id]);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, medicines]);

  const loadCategory = async (categoryId: string) => {
    try {
      const categories = await categoriesService.getAll();
      const foundCategory = categories.find(c => c.id === categoryId);
      if (foundCategory) {
        setCategory(foundCategory);
      } else {
        notificationService.error('Erro', 'Categoria não encontrada.');
        navigate('/categorias');
      }
    } catch (err) {
      notificationService.error('Erro', 'Não foi possível carregar a categoria.');
      navigate('/categorias');
    }
  };

  const loadMedicines = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const allMedicines = await medicinesService.getAll();
      const categoryMedicines = allMedicines.filter(m => m.categoria?.id === categoryId);
      const sorted = categoryMedicines.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setMedicines(sorted);
    } catch (err) {
      console.error('Error loading medicines:', err);
      notificationService.error('Erro', 'Não foi possível carregar os medicamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredMedicines(medicines);
      return;
    }
    const filtered = medicines.filter(med => 
      med.nome.toLowerCase().includes(term) ||
      med.descricao?.toLowerCase().includes(term) ||
      med.preco.toString().includes(term) ||
      med.quantidadeEstoque.toString().includes(term)
    );
    setFilteredMedicines(filtered);
  };

  const toggleMedicineStatus = async (medicine: Medicine) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para ativar/inativar medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }

    const newStatus = !medicine.ativo;
    const action = newStatus ? 'ativar' : 'inativar';
    const confirmButtonText = newStatus ? 'Sim, Ativar!' : 'Sim, Inativar!';

    const result = await notificationService.confirm(
      `Confirmar ${newStatus ? 'Ativação' : 'Inativação'}`,
      `Deseja ${action} o medicamento "${medicine.nome}"?`,
      confirmButtonText
    );

    if (result.isConfirmed) {
      try {
        await medicinesService.updateStatus(medicine.id, newStatus);
        notificationService.success(
          'Status Atualizado!',
          `Medicamento "${medicine.nome}" foi ${newStatus ? 'ativado' : 'inativado'} com sucesso.`
        );
        if (id) loadMedicines(id);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Não foi possível atualizar o status.';
        notificationService.error('Erro', errorMessage);
      }
    }
  };

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:8081${imagePath}`;
  };

  const formatValidade = (validade: string | undefined): string => {
    if (!validade) return 'Sem validade';
    try {
      const validadeStr = String(validade).trim();
      let date: Date;
      if (validadeStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [year, month, day] = validadeStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else if (validadeStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        const [day, month, year] = validadeStr.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(validadeStr);
      }
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Data inválida';
    }
  };

  const getCurrentImageIndex = (medicineId: string): number => {
    return currentImageIndex.get(medicineId) || 0;
  };

  const nextImage = (medicineId: string, totalImages: number) => {
    const current = getCurrentImageIndex(medicineId);
    const next = (current + 1) % totalImages;
    const newMap = new Map(currentImageIndex);
    newMap.set(medicineId, next);
    setCurrentImageIndex(newMap);
  };

  const previousImage = (medicineId: string, totalImages: number) => {
    const current = getCurrentImageIndex(medicineId);
    const prev = (current - 1 + totalImages) % totalImages;
    const newMap = new Map(currentImageIndex);
    newMap.set(medicineId, prev);
    setCurrentImageIndex(newMap);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'ADMIN';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/categorias')}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            title="Voltar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568] leading-normal">
              Medicamentos - {category?.nome || 'Carregando...'}
            </h1>
            <p className="text-lg text-gray-600">Visualize todos os medicamentos desta categoria.</p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, descrição, preço ou estoque..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-200 text-gray-900"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Carregando medicamentos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMedicines.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 text-center p-8 text-gray-500">
              {searchTerm ? `Nenhum medicamento encontrado para "${searchTerm}".` : 'Nenhum medicamento encontrado nesta categoria.'}
            </div>
          ) : (
            filteredMedicines.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {med.imagens && med.imagens.length > 0 ? (
                  <div className="relative w-full h-48 bg-gray-100">
                    {med.imagens.length > 1 && (
                      <>
                        <button
                          onClick={() => previousImage(med.id, med.imagens!.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => nextImage(med.id, med.imagens!.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    <img
                      src={getImageUrl(med.imagens[getCurrentImageIndex(med.id)])}
                      alt={med.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-lg text-gray-800 flex-grow">{med.nome}</h4>
                      {med.ativo ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>
                      )}
                    </div>
                    {med.categoria && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Categoria:</span> {med.categoria.nome}
                      </p>
                    )}
                    {med.descricao && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{med.descricao}</p>
                    )}
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Estoque:</span>{' '}
                        <span className={med.quantidadeEstoque === 0 ? 'text-red-600' : 'text-green-600'}>
                          {med.quantidadeEstoque} unidade(s)
                        </span>
                      </p>
                      {med.validade && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Validade:</span> {formatValidade(med.validade)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-2xl font-bold text-indigo-600">{formatCurrency(med.preco)}</span>
                    {isAdmin() && (
                      <button
                        onClick={() => toggleMedicineStatus(med)}
                        className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition-transform ${
                          med.ativo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {med.ativo ? 'Inativar' : 'Ativar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryMedicines;

