import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { medicinesService } from '../services/medicines';
import { categoriesService } from '../services/categories';
import { notificationService } from '../services/notification';
import { useAuthStore } from '../services/auth';
import { Medicine, Category, MedicineRequest } from '../models/types';
import Modal from '../components/Modal';

const Medicines: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Adicionar Medicamento');
  const [currentMedicineId, setCurrentMedicineId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MedicineRequest>({
    nome: '',
    descricao: '',
    preco: 0,
    quantidadeEstoque: 0,
    validade: '',
    ativo: true,
    categoriaId: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    loadMedicines();
    loadCategories();
  }, [activeTab]);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, medicines]);

  const loadMedicines = async () => {
    setIsLoading(true);
    try {
      const data = await medicinesService.getAll();
      let filtered = activeTab === 'active' 
        ? data.filter(m => m.ativo) 
        : data.filter(m => !m.ativo);
      
      const sortedData = filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setMedicines(sortedData);
    } catch (err: any) {
      console.error('Error loading medicines:', err);
      notificationService.error('Erro', 'Não foi possível carregar os medicamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
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
      med.categoria?.nome.toLowerCase().includes(term) ||
      med.id.toLowerCase().includes(term)
    );
    setFilteredMedicines(filtered);
  };

  const openCreateModal = () => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para criar medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }
    setCurrentMedicineId(null);
    setModalTitle('Adicionar Medicamento');
    setFormData({
      nome: '',
      descricao: '',
      preco: 0,
      quantidadeEstoque: 0,
      validade: '',
      ativo: true,
      categoriaId: '',
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para editar medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }
    setCurrentMedicineId(med.id);
    setModalTitle('Editar Medicamento');
    
    let validadeFormatted = '';
    if (med.validade) {
      if (med.validade.includes('T')) {
        validadeFormatted = med.validade.split('T')[0];
      } else if (med.validade.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [dia, mes, ano] = med.validade.split('/');
        validadeFormatted = `${ano}-${mes}-${dia}`;
      } else {
        validadeFormatted = med.validade;
      }
    }
    
    setFormData({
      nome: med.nome,
      descricao: med.descricao || '',
      preco: med.preco,
      quantidadeEstoque: med.quantidadeEstoque,
      validade: validadeFormatted,
      ativo: med.ativo !== undefined ? med.ativo : true,
      categoriaId: med.categoria?.id || '',
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages(med.imagens || []);
    setIsModalOpen(true);
  };

  const saveMedicine = async () => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para salvar medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }

    if (!formData.nome || !formData.preco || formData.preco <= 0 || !formData.quantidadeEstoque || formData.quantidadeEstoque < 0 || !formData.validade || !formData.categoriaId) {
      notificationService.error('Formulário Inválido', 'Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const id = currentMedicineId;
    const imagesToUpload = selectedImages;
    const existingImgs = existingImages;
    const totalImages = imagesToUpload.length + existingImgs.length;

    if (!id && imagesToUpload.length === 0) {
      notificationService.error('Imagens Obrigatórias', 'É necessário pelo menos 1 imagem e no máximo 3 imagens.');
      return;
    }

    if (id && imagesToUpload.length === 0 && existingImgs.length === 0) {
      notificationService.error('Imagens Obrigatórias', 'É necessário pelo menos 1 imagem. Adicione novas imagens ou mantenha as existentes.');
      return;
    }

    if (imagesToUpload.length > 3 || totalImages > 3) {
      notificationService.error('Muitas Imagens', `Você possui ${totalImages} imagem(ns). É permitido no máximo 3 imagens no total.`);
      return;
    }

    try {
      if (id) {
        await medicinesService.update(id, formData, imagesToUpload.length > 0 ? imagesToUpload : null);
        notificationService.success('Medicamento atualizado!', 'O registro foi salvo com sucesso.');
      } else {
        await medicinesService.create(formData, imagesToUpload);
        notificationService.success('Medicamento criado!', 'O registro foi salvo com sucesso.');
      }
      loadMedicines();
      setIsModalOpen(false);
      setSelectedImages([]);
      setImagePreviews([]);
      setExistingImages([]);
    } catch (err: any) {
      console.error('Error saving medicine:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
      notificationService.error('Erro ao Salvar', errorMessage);
    }
  };

  const deleteMedicine = async (id: string) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para excluir medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }

    const result = await notificationService.confirm('Confirmar Exclusão', 'Você tem certeza que deseja excluir este medicamento? Esta ação é irreversível.');
    if (result.isConfirmed) {
      try {
        await medicinesService.delete(id);
        notificationService.success('Excluído!', 'O medicamento foi excluído com sucesso.');
        loadMedicines();
      } catch (err: any) {
        console.error('Error deleting medicine:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Não foi possível excluir o medicamento.';
        notificationService.error('Erro ao Excluir', errorMessage);
      }
    }
  };

  const inactivateMedicine = async (med: Medicine) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para inativar medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }

    const result = await notificationService.confirm('Confirmar Inativação', `Você tem certeza que deseja inativar o medicamento "${med.nome}"?`, 'Sim, inativar!');
    if (result.isConfirmed) {
      try {
        await medicinesService.updateStatus(med.id, false);
        notificationService.success('Inativado!', `O medicamento ${med.nome} foi inativado.`);
        setActiveTab('inactive');
        loadMedicines();
      } catch (err) {
        console.error('Error inactivating medicine:', err);
        notificationService.error('Erro', 'Não foi possível inativar o medicamento.');
      }
    }
  };

  const reactivateMedicine = async (med: Medicine) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para reativar medicamentos. Apenas administradores podem realizar esta ação.');
      return;
    }

    try {
      await medicinesService.updateStatus(med.id, true);
      notificationService.success('Reativado!', `O medicamento ${med.nome} foi reativado.`);
      setActiveTab('active');
      loadMedicines();
    } catch (err) {
      console.error('Error reactivating medicine:', err);
      notificationService.error('Erro', 'Não foi possível reativar o medicamento.');
    }
  };

  const onImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const totalWithNew = selectedImages.length + files.length + existingImages.length;
      
      if (totalWithNew > 3) {
        notificationService.error('Muitas Imagens', `Você possui ${totalWithNew} imagem(ns). É permitido no máximo 3 imagens no total.`);
        input.value = '';
        return;
      }
      
      setSelectedImages([...selectedImages, ...files]);
      
      const newPreviews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      input.value = '';
    }
  };

  const removeImage = (index: number) => {
    const images = [...selectedImages];
    images.splice(index, 1);
    setSelectedImages(images);
    
    const previews = [...imagePreviews];
    previews.splice(index, 1);
    setImagePreviews(previews);
  };

  const removeExistingImage = (index: number) => {
    const existing = [...existingImages];
    existing.splice(index, 1);
    setExistingImages(existing);
  };

  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getShortId = (id: string): string => {
    if (!id) return '-';
    return id.substring(0, 8) + '...';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      notificationService.success('Copiado!', 'ID copiado para a área de transferência.');
    }).catch(() => {
      notificationService.error('Erro', 'Não foi possível copiar o ID.');
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'ADMIN';
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
            Gerenciar Medicamentos
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1">
            Adicione, edite e organize os medicamentos da farmácia.
          </p>
        </div>
        {isAdmin() && (
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Medicamento
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-[#2D3345] text-[#2D3345]'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inactive'
                ? 'border-[#2D3345] text-[#2D3345]'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inativos
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, descrição, categoria ou ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-200 text-gray-900"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando medicamentos...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `Nenhum medicamento encontrado para "${searchTerm}".` : 'Nenhum medicamento encontrado.'}
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm text-gray-600 font-mono cursor-pointer group relative inline-block"
                          onClick={() => copyToClipboard(med.id)}
                        >
                          <span className="hover:text-gray-900 transition-colors">{getShortId(med.id)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{med.nome}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs group relative">
                          {med.descricao ? (
                            <span className="block truncate">{med.descricao}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{med.categoria?.nome || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{med.quantidadeEstoque}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(med.preco)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{med.validade || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isAdmin() ? (
                          <div className="flex items-center justify-end space-x-1">
                            {activeTab === 'active' && (
                              <button
                                onClick={() => inactivateMedicine(med)}
                                className="p-2 rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
                                title="Inativar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            )}
                            {activeTab === 'inactive' && (
                              <button
                                onClick={() => reactivateMedicine(med)}
                                className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                title="Reativar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(med)}
                              className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteMedicine(med.id)}
                              className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                              title="Excluir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Apenas visualização</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <Modal isOpen={isModalOpen} title={modalTitle} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); saveMedicine(); }} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preço <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantidade em Estoque <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantidadeEstoque}
                onChange={(e) => setFormData({ ...formData, quantidadeEstoque: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data de Validade <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={getMinDate()}
                value={formData.validade}
                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 py-3 px-4 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 py-3 px-4 text-gray-900"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-[#99E0FF] cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Medicamento Ativo</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Imagens (mínimo 1, máximo 3)</label>
            <input
              type="file"
              onChange={onImageSelected}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-200 focus:outline-none focus:border-indigo-500 py-3 px-4"
            />
            <p className="mt-1 text-xs text-gray-500">Selecione entre 1 e 3 imagens (JPG, PNG ou WebP, máx 5MB cada)</p>
            
            {(imagePreviews.length > 0 || existingImages.length > 0) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-300" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={`http://localhost:8081${img}`} alt="Imagem existente" className="w-full h-32 object-cover rounded-lg border border-gray-300" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform text-sm sm:text-base"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medicines;

