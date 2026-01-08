import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesService } from '../services/categories';
import { notificationService } from '../services/notification';
import { useAuthStore } from '../services/auth';
import { Category, CategoryRequest } from '../models/types';
import Modal from '../components/Modal';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Adicionar Categoria');
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryRequest>({
    nome: '',
    descricao: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesService.getAll();
      const sortedData = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setCategories(sortedData);
    } catch (err) {
      console.error('Error loading categories:', err);
      notificationService.error('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredCategories(categories);
      return;
    }
    const filtered = categories.filter(cat => 
      cat.nome.toLowerCase().includes(term) ||
      cat.descricao?.toLowerCase().includes(term) ||
      cat.id.toLowerCase().includes(term)
    );
    setFilteredCategories(filtered);
  };

  const openCreateModal = () => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para criar categorias. Apenas administradores podem realizar esta ação.');
      return;
    }
    setCurrentCategoryId(null);
    setModalTitle('Adicionar Categoria');
    setFormData({ nome: '', descricao: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para editar categorias. Apenas administradores podem realizar esta ação.');
      return;
    }
    setCurrentCategoryId(cat.id);
    setModalTitle('Editar Categoria');
    setFormData({ nome: cat.nome, descricao: cat.descricao || '' });
    setIsModalOpen(true);
  };

  const saveCategory = async () => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para salvar categorias. Apenas administradores podem realizar esta ação.');
      return;
    }

    if (!formData.nome) {
      notificationService.error('Campo Obrigatório', 'O campo Nome é obrigatório. Por favor, preencha o nome.');
      return;
    }

    try {
      if (currentCategoryId) {
        await categoriesService.update(currentCategoryId, formData);
        notificationService.success('Categoria atualizada!', 'O registro foi salvo com sucesso.');
      } else {
        await categoriesService.create(formData);
        notificationService.success('Categoria criada!', 'O registro foi salvo com sucesso.');
      }
      loadCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
      notificationService.error('Erro ao Salvar', errorMessage);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para excluir categorias. Apenas administradores podem realizar esta ação.');
      return;
    }

    const result = await notificationService.confirm('Confirmar Exclusão', 'Você tem certeza? Excluir uma categoria pode afetar medicamentos associados.');
    if (result.isConfirmed) {
      try {
        await categoriesService.delete(id);
        notificationService.success('Excluído!', 'A categoria foi excluída com sucesso.');
        loadCategories();
      } catch (err: any) {
        notificationService.error('Erro ao Excluir', err.response?.data?.error || 'Não foi possível excluir. Verifique se não há medicamentos nesta categoria.');
      }
    }
  };

  const viewCategoryDetails = (categoryId: string) => {
    navigate(`/categorias/${categoryId}/medicamentos`);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'ADMIN';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568] leading-normal">
            Gerenciar Categorias
          </h1>
          <p className="text-lg text-gray-600">Organize os medicamentos em categorias.</p>
        </div>
        {isAdmin() && (
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Categoria
          </button>
        )}
      </header>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, descrição ou ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-200 text-gray-900"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando categorias...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `Nenhuma categoria encontrada para "${searchTerm}".` : 'Nenhuma categoria encontrada.'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="group relative flex items-center">
                          <span className="font-mono text-xs">{cat.id.substring(0, 8)}...</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(cat.id);
                              notificationService.success('ID Copiado!', 'O ID foi copiado para a área de transferência.');
                            }}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                            title="Copiar ID completo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                            {cat.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="group relative">
                          <div className="block truncate max-w-xs">{cat.descricao || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => viewCategoryDetails(cat.id)}
                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Ver Detalhes"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {isAdmin() && (
                            <>
                              <button
                                onClick={() => openEditModal(cat)}
                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                                title="Editar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteCategory(cat.id)}
                                className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                title="Excluir"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
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
        <form onSubmit={(e) => { e.preventDefault(); saveCategory(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome da Categoria <span className="text-red-500">*</span>
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
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;

