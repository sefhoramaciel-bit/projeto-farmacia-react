import React, { useState, useEffect } from 'react';
import { usersService, UserRequest } from '../services/users';
import { notificationService } from '../services/notification';
import { User } from '../models/types';
import Modal from '../components/Modal';
import { environment } from '../config/environment';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Adicionar Usuário');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserRequest>({
    nome: '',
    email: '',
    password: '',
    role: 'VENDEDOR',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getAll();
      const sortedData = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setUsers(sortedData);
    } catch (err) {
      console.error('Error loading users:', err);
      notificationService.error('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(user => 
      user.nome.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user.id.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const openCreateModal = () => {
    setCurrentUserId(null);
    setModalTitle('Adicionar Usuário');
    setFormData({ nome: '', email: '', password: '', role: 'VENDEDOR' });
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setCurrentAvatarUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setCurrentUserId(user.id);
    setModalTitle('Editar Usuário');
    setFormData({ nome: user.nome, email: user.email, password: '', role: user.role });
    setSelectedAvatar(null);
    setAvatarPreview(null);
    if (user.avatarUrl) {
      setCurrentAvatarUrl(getAvatarUrl(user.avatarUrl));
    } else {
      setCurrentAvatarUrl(null);
    }
    setIsModalOpen(true);
  };

  const onAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        notificationService.error('Formato Inválido', 'Por favor, selecione uma imagem JPG, PNG ou WebP.');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        notificationService.error('Arquivo muito grande', 'O arquivo deve ter no máximo 5MB.');
        input.value = '';
        return;
      }
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUser = async () => {
    if (!formData.nome || !formData.email || !formData.role) {
      notificationService.error('Formulário Inválido', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!currentUserId && !formData.password) {
      notificationService.error('Campo Obrigatório', 'O campo Senha é obrigatório. Por favor, preencha a senha.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      notificationService.error('Senha Inválida', 'O campo Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      if (currentUserId) {
        await usersService.update(currentUserId, formData, selectedAvatar);
        notificationService.success('Usuário atualizado!', 'O registro foi salvo com sucesso.');
      } else {
        await usersService.create(formData, selectedAvatar);
        notificationService.success('Usuário criado!', 'O registro foi salvo com sucesso.');
      }
      loadUsers();
      setIsModalOpen(false);
      setSelectedAvatar(null);
      setAvatarPreview(null);
      setCurrentAvatarUrl(null);
    } catch (err: any) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro. Tente novamente.';
      notificationService.error('Erro ao Salvar', errorMessage);
    }
  };

  const deleteUser = async (id: string) => {
    const result = await notificationService.confirm('Confirmar Exclusão', 'Você tem certeza que deseja excluir este usuário? Esta ação é irreversível.');
    if (result.isConfirmed) {
      try {
        await usersService.delete(id);
        notificationService.success('Excluído!', 'O usuário foi excluído com sucesso.');
        loadUsers();
      } catch (err: any) {
        notificationService.error('Erro ao Excluir', err.response?.data?.error || 'Não foi possível excluir o usuário.');
      }
    }
  };

  const getRoleLabel = (role: string): string => {
    return role === 'ADMIN' ? 'Administrador' : 'Vendedor';
  };

  const getRoleBadgeClass = (role: string): string => {
    return role === 'ADMIN'
      ? 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800'
      : 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
  };

  const getAvatarUrl = (avatarUrl: string): string => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
            Gerenciar Usuários
          </h1>
          <p className="text-lg text-gray-600">Visualize e gerencie os usuários do sistema.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 md:mt-0 flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar Usuário
        </button>
      </header>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email, perfil ou ID..."
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
          <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="group relative flex items-center">
                          <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.id);
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
                            {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleBadgeClass(user.role)}>{getRoleLabel(user.role)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                            title="Excluir"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
        <form onSubmit={(e) => { e.preventDefault(); saveUser(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome Completo <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha {!currentUserId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
              required={!currentUserId}
              minLength={currentUserId ? undefined : 6}
            />
            {currentUserId && (
              <p className="mt-1 text-xs text-gray-500">Deixe em branco para manter a senha atual.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Perfil <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'VENDEDOR' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 py-3 px-4 text-gray-900"
              required
            >
              <option value="VENDEDOR">Vendedor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar (opcional)</label>
            <input
              type="file"
              onChange={onAvatarSelected}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-200 focus:outline-none focus:border-indigo-500 py-3 px-4"
            />
            <p className="mt-1 text-xs text-gray-500">Selecione uma imagem (JPG, PNG ou WebP, máx 5MB)</p>
            {currentUserId && currentAvatarUrl && !avatarPreview && (
              <div className="mt-4 relative inline-block">
                <p className="text-xs text-gray-600 mb-2">Avatar atual:</p>
                <img src={currentAvatarUrl} alt="Avatar atual" className="w-32 h-32 object-cover rounded-full border-2 border-gray-300" />
              </div>
            )}
            {avatarPreview && (
              <div className="mt-4 relative inline-block">
                <p className="text-xs text-gray-600 mb-2">Novo avatar:</p>
                <img src={avatarPreview} alt="Avatar preview" className="w-32 h-32 object-cover rounded-full border-2 border-gray-300" />
              </div>
            )}
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

export default Users;

