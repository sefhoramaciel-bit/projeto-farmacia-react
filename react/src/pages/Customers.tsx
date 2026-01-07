import React, { useState, useEffect } from 'react';
import { customersService } from '../services/customers';
import { notificationService } from '../services/notification';
import { useAuthStore } from '../services/auth';
import { Customer, CustomerRequest } from '../models/types';
import Modal from '../components/Modal';

const Customers: React.FC = () => {
  const { currentUser } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Adicionar Cliente');
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerRequest>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    dataNascimento: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customersService.getAll();
      const sortedData = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setCustomers(sortedData);
    } catch (err) {
      console.error('Error loading customers:', err);
      notificationService.error('Erro', 'Não foi possível carregar os clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter(cust => 
      cust.nome.toLowerCase().includes(term) ||
      cust.cpf.toLowerCase().includes(term) ||
      cust.email.toLowerCase().includes(term) ||
      cust.id.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const formatCpf = (value: string): string => {
    let clean = value.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    if (clean.length > 9) {
      clean = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length > 6) {
      clean = clean.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (clean.length > 3) {
      clean = clean.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }
    return clean;
  };

  const formatTelefone = (value: string): string => {
    let clean = value.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    if (clean.length > 10) {
      clean = clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (clean.length > 6) {
      clean = clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (clean.length > 2) {
      clean = clean.replace(/(\d{2})(\d{0,})/, '($1) $2');
    } else if (clean.length > 0) {
      clean = `(${clean}`;
    }
    return clean;
  };

  const openCreateModal = () => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para criar clientes. Apenas administradores podem realizar esta ação.');
      return;
    }
    setCurrentCustomerId(null);
    setModalTitle('Adicionar Cliente');
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      dataNascimento: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para editar clientes. Apenas administradores podem realizar esta ação.');
      return;
    }
    setCurrentCustomerId(cust.id);
    setModalTitle('Editar Cliente');
    
    let dataNascimentoFormatted = '';
    if (cust.dataNascimento) {
      if (cust.dataNascimento.includes('T')) {
        dataNascimentoFormatted = cust.dataNascimento.split('T')[0];
      } else if (cust.dataNascimento.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [dia, mes, ano] = cust.dataNascimento.split('/');
        dataNascimentoFormatted = `${ano}-${mes}-${dia}`;
      } else {
        dataNascimentoFormatted = cust.dataNascimento;
      }
    }
    
    setFormData({
      nome: cust.nome,
      cpf: cust.cpf,
      email: cust.email,
      telefone: cust.telefone || '',
      endereco: cust.endereco || '',
      dataNascimento: dataNascimentoFormatted,
    });
    setIsModalOpen(true);
  };

  const saveCustomer = async () => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para salvar clientes. Apenas administradores podem realizar esta ação.');
      return;
    }

    if (!formData.nome || !formData.cpf || !formData.email || !formData.dataNascimento) {
      notificationService.error('Formulário Inválido', 'Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    if (!/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(formData.cpf)) {
      notificationService.error('CPF Inválido', 'O CPF deve estar no formato 000.000.000-00. Por favor, verifique o CPF.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      notificationService.error('E-mail Inválido', 'O e-mail informado é inválido. Por favor, informe um e-mail válido.');
      return;
    }

    try {
      if (currentCustomerId) {
        await customersService.update(currentCustomerId, formData);
        notificationService.success('Cliente atualizado!', 'O registro foi salvo com sucesso.');
      } else {
        await customersService.create(formData);
        notificationService.success('Cliente criado!', 'O registro foi salvo com sucesso.');
      }
      loadCustomers();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving customer:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
      notificationService.error('Erro ao Salvar', errorMessage);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!isAdmin()) {
      notificationService.error('Acesso Negado', 'Você não tem permissão para excluir clientes. Apenas administradores podem realizar esta ação.');
      return;
    }

    const result = await notificationService.confirm('Confirmar Exclusão', 'Você tem certeza que deseja excluir este cliente?');
    if (result.isConfirmed) {
      try {
        await customersService.delete(id);
        notificationService.success('Excluído!', 'O cliente foi excluído com sucesso.');
        loadCustomers();
      } catch (err: any) {
        notificationService.error('Erro ao Excluir', err.response?.data?.error || 'Não foi possível excluir o cliente.');
      }
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'ADMIN';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
            Gerenciar Clientes
          </h1>
          <p className="text-lg text-gray-600">Visualize e gerencie os clientes da farmácia.</p>
        </div>
        {isAdmin() && (
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Cliente
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
            placeholder="Buscar por nome, CPF, email ou ID..."
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
          <div className="p-8 text-center text-gray-500">Carregando clientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Nascimento</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `Nenhum cliente encontrado para "${searchTerm}".` : 'Nenhum cliente encontrado.'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{cust.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cust.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.cpf}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.telefone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={cust.endereco || '-'}>
                          {cust.endereco || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cust.dataNascimento ? formatDate(cust.dataNascimento) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isAdmin() ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(cust)}
                              className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteCustomer(cust.id)}
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
        <form onSubmit={(e) => { e.preventDefault(); saveCustomer(); }} className="space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCpf(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 py-3 px-4 text-gray-900"
                required
              />
            </div>
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
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <textarea
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              rows={2}
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

export default Customers;

