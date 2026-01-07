import React, { useState, useEffect, useMemo } from 'react';
import { medicinesService } from '../services/medicines';
import { customersService } from '../services/customers';
import { salesService } from '../services/sales';
import { notificationService } from '../services/notification';
import { Medicine, Customer, CartItem, SaleRequest } from '../models/types';

const Sales: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cpf, setCpf] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState<Map<string, number>>(new Map());

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.preco * item.quantidadeCarrinho, 0);
  }, [cart]);

  useEffect(() => {
    if (customer) {
      loadAllValidMedicines();
    }
  }, [customer]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      const allValid = filterValidMedicines(allMedicines);
      setSearchResults(allValid);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchMedicines(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allMedicines]);

  const filterValidMedicines = (medicines: Medicine[]): Medicine[] => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return medicines.filter(med => {
      if (!med.ativo) return false;

      if (med.validade) {
        try {
          const validadeStr = String(med.validade).trim();
          if (!validadeStr) return true;

          let dataValidade: Date;
          if (validadeStr.match(/^\d{4}-\d{2}-\d{2}/)) {
            const [year, month, day] = validadeStr.split('-').map(Number);
            dataValidade = new Date(year, month - 1, day);
          } else if (validadeStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
            const [day, month, year] = validadeStr.split('/').map(Number);
            dataValidade = new Date(year, month - 1, day);
          } else {
            dataValidade = new Date(validadeStr);
          }

          if (isNaN(dataValidade.getTime())) return false;
          dataValidade.setHours(0, 0, 0, 0);
          if (dataValidade.getTime() < hoje.getTime()) return false;
        } catch {
          return false;
        }
      }

      return true;
    });
  };

  const loadAllValidMedicines = async () => {
    setIsSearching(true);
    try {
      const medicines = await medicinesService.getActive();
      const validMedicines = filterValidMedicines(medicines);
      const sorted = validMedicines.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setAllMedicines(sorted);
      setSearchResults(sorted);
    } catch (err) {
      console.error('Error loading medicines:', err);
      notificationService.error('Erro', 'Não foi possível carregar os medicamentos.');
    } finally {
      setIsSearching(false);
    }
  };

  const searchMedicines = async (term: string) => {
    setIsSearching(true);
    try {
      const medicines = await medicinesService.getActive();
      const filtered = medicines.filter(m => 
        m.ativo && (
          m.nome.toLowerCase().includes(term.toLowerCase()) ||
          m.categoria?.nome.toLowerCase().includes(term.toLowerCase())
        )
      );
      const validResults = filterValidMedicines(filtered);
      const sorted = validResults.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setSearchResults(sorted);
    } catch (err) {
      console.error('Error searching medicines:', err);
    } finally {
      setIsSearching(false);
    }
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

  const findCustomer = async () => {
    if (!/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf)) {
      notificationService.error('CPF Inválido', 'Por favor, insira um CPF válido no formato 000.000.000-00.');
      return;
    }

    try {
      const cust = await customersService.getByCpf(cpf);
      if (cust) {
        setCustomer(cust);
        notificationService.success('Cliente Encontrado', `Iniciando venda para ${cust.nome}.`);
        loadAllValidMedicines();
      } else {
        notificationService.error('Cliente não Encontrado', 'Nenhum cliente com este CPF. Cadastre-o primeiro.');
      }
    } catch (err) {
      console.error('Error finding customer:', err);
      notificationService.error('Erro', 'Não foi possível buscar o cliente.');
    }
  };

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantidadeCarrinho + 1);
    } else {
      if (medicine.quantidadeEstoque > 0) {
        const newItem: CartItem = { ...medicine, quantidadeCarrinho: 1 };
        setCart([...cart, newItem]);
      } else {
        notificationService.error('Sem Estoque', `${medicine.nome} não está disponível em estoque.`);
      }
    }
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    setCart(currentCart =>
      currentCart.map(item => {
        if (item.id === medicineId) {
          if (newQuantity <= 0) return null;
          if (newQuantity > item.quantidadeEstoque) {
            notificationService.error('Estoque Insuficiente', `Apenas ${item.quantidadeEstoque} unidades de ${item.nome} disponíveis.`);
            return { ...item, quantidadeCarrinho: item.quantidadeEstoque };
          }
          return { ...item, quantidadeCarrinho: newQuantity };
        }
        return item;
      }).filter(item => item !== null) as CartItem[]
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== medicineId));
  };

  const finalizeSale = async () => {
    if (cart.length === 0) {
      notificationService.error('Carrinho Vazio', 'Adicione pelo menos um item para finalizar a venda.');
      return;
    }

    if (!customer) {
      notificationService.error('Cliente não encontrado', 'Selecione um cliente primeiro.');
      return;
    }

    const sale: SaleRequest = {
      clienteId: customer.id,
      itens: cart.map(item => ({
        medicamentoId: item.id,
        quantidade: item.quantidadeCarrinho,
      })),
    };

    try {
      const res = await salesService.create(sale);
      notificationService.success('Venda Finalizada!', `Venda #${res.id} registrada com sucesso.`);
      clearSale();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Não foi possível registrar a venda. Tente novamente.';
      notificationService.error('Erro na Venda', errorMessage);
    }
  };

  const resetSale = async () => {
    if (cart.length > 0 && customer) {
      const sale: SaleRequest = {
        clienteId: customer.id,
        itens: cart.map(item => ({
          medicamentoId: item.id,
          quantidade: item.quantidadeCarrinho,
        })),
      };

      try {
        await salesService.createCancelada(sale);
        notificationService.success('Venda Cancelada', 'Venda cancelada registrada com sucesso.');
      } catch (err) {
        console.error('Error registering cancelled sale:', err);
      }
    }
    clearSale();
  };

  const clearSale = () => {
    setCustomer(null);
    setCart([]);
    setSearchResults([]);
    setAllMedicines([]);
    setCpf('');
    setSearchTerm('');
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

  if (!customer) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
            Ponto de Venda
          </h1>
          <p className="text-lg text-gray-600">Realize vendas de forma rápida e integrada.</p>
        </header>

        <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Identificar Cliente</h2>
          <p className="text-gray-600 mt-2">Para iniciar uma venda, por favor, insira o CPF do cliente.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              findCustomer();
            }}
            className="mt-6 flex gap-2"
          >
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              className="flex-grow w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 text-gray-900 pl-4"
            />
            <button
              type="submit"
              className="px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:scale-105 transform transition-transform"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
          Ponto de Venda
        </h1>
        <p className="text-lg text-gray-600">Realize vendas de forma rápida e integrada.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Search & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Cliente: <span className="text-indigo-600">{customer.nome}</span>
            </h3>
            <div className="relative mt-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou categoria do medicamento..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-200 text-gray-900"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isSearching ? (
              <div className="md:col-span-2 xl:col-span-3 text-center p-8">Buscando...</div>
            ) : searchResults.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 text-center p-8 text-gray-500">
                Nenhum medicamento encontrado.
              </div>
            ) : (
              searchResults.map((med) => (
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
                      <h4 className="font-bold text-lg text-gray-800 mb-1">{med.nome}</h4>
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
                      <button
                        onClick={() => addToCart(med)}
                        disabled={med.quantidadeEstoque === 0}
                        className="p-3 rounded-full bg-gradient-to-r from-[#2D3345] to-[#4A5568] text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-24">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Carrinho</h3>
            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">O carrinho está vazio.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3 mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.nome}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Preço unitário:</span> {formatCurrency(item.preco)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Subtotal:</span> {formatCurrency(item.preco * item.quantidadeCarrinho)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.quantidadeCarrinho}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center rounded-md border-gray-300 shadow-sm bg-gray-200 text-gray-900"
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <button
                  onClick={finalizeSale}
                  className="mt-6 w-full py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#FE5D5C] to-[#E53E3E] hover:scale-105 transform transition-transform"
                >
                  Finalizar Venda
                </button>
              </div>
            )}
            <button
              onClick={resetSale}
              className="mt-4 w-full text-center text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Cancelar Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;

