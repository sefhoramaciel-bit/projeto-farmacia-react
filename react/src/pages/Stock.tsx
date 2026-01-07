import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { medicinesService } from '../services/medicines';
import { stockService } from '../services/stock';
import { notificationService } from '../services/notification';
import { Medicine, StockRequest } from '../models/types';

const Stock: React.FC = () => {
  const location = useLocation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<StockRequest>({
    medicamentoId: '',
    quantidade: 1,
    motivo: '',
  });
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, medicines]);

  useEffect(() => {
    const medicamentoId = (location.state as any)?.medicamento;
    if (medicamentoId && medicines.length > 0) {
      const medicine = medicines.find(m => m.id === medicamentoId);
      if (medicine) {
        setSelectedMedicine(medicine);
        setFormData(prev => ({ ...prev, medicamentoId: medicamentoId }));
      }
    }
  }, [location.state, medicines]);

  const loadMedicines = async () => {
    try {
      const data = await medicinesService.getActive();
      const sortedData = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setMedicines(sortedData);
    } catch (err) {
      console.error('Error loading medicines:', err);
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
      med.id.toLowerCase().includes(term)
    );
    setFilteredMedicines(filtered);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicamentoId || !formData.quantidade || formData.quantidade <= 0) {
      notificationService.error('Formulário Inválido', 'Selecione um medicamento e a quantidade.');
      return;
    }

    const medicine = medicines.find(m => m.id === formData.medicamentoId);
    if (!medicine) {
      notificationService.error('Erro', 'Medicamento não encontrado.');
      return;
    }

    if (tipo === 'saida' && formData.quantidade > medicine.quantidadeEstoque) {
      notificationService.error('Estoque Insuficiente', `A quantidade de saída (${formData.quantidade}) é maior que o estoque atual (${medicine.quantidadeEstoque}).`);
      return;
    }

    try {
      const request: StockRequest = {
        medicamentoId: formData.medicamentoId,
        quantidade: formData.quantidade,
        motivo: formData.motivo,
      };

      if (tipo === 'entrada') {
        await stockService.entrada(request);
      } else {
        await stockService.saida(request);
      }

      notificationService.success('Movimentação Registrada!', `A ${tipo} de ${formData.quantidade} unidade(s) de ${medicine.nome} foi registrada.`);
      setFormData({ medicamentoId: '', quantidade: 1, motivo: '' });
      setSelectedMedicine(null);
      setSearchTerm('');
      loadMedicines();
    } catch (err: any) {
      console.error('Error registering stock movement:', err);
      notificationService.error('Erro', 'Não foi possível registrar a movimentação.');
    }
  };

  const selectMedicine = (med: Medicine) => {
    setSelectedMedicine(med);
    setFormData({ ...formData, medicamentoId: med.id });
    setSearchTerm('');
    setIsSelectOpen(false);
  };

  const getDisplayValue = (): string => {
    if (selectedMedicine) {
      return `${selectedMedicine.nome} (Estoque: ${selectedMedicine.quantidadeEstoque})`;
    }
    return 'Selecione um medicamento...';
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
          Controle de Estoque
        </h1>
        <p className="text-lg text-gray-600">Registre entradas e saídas de medicamentos.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicamento</label>
            <div className="custom-select-container relative">
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="relative w-full pl-3 pr-10 py-2.5 text-left text-base border border-gray-300 rounded-xl bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <span className="block truncate">{getDisplayValue()}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {isSelectOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsSelectOpen(true);
                        }}
                        placeholder="Buscar medicamento..."
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMedicines.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">Nenhum medicamento encontrado</div>
                    ) : (
                      filteredMedicines.map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => selectMedicine(med)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-indigo-50 hover:text-indigo-900 focus:outline-none focus:bg-indigo-50 focus:text-indigo-900"
                        >
                          {med.nome} (Estoque: {med.quantidadeEstoque})
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <input type="hidden" value={formData.medicamentoId} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação</label>
            <div className="mt-2 flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setTipo('entrada')}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium transition-colors ${
                  tipo === 'entrada'
                    ? 'bg-gradient-to-r from-[#99E0FF] to-[#c1eefd] text-[#2D3345]'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setTipo('saida')}
                className={`-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium transition-colors ${
                  tipo === 'saida'
                    ? 'bg-gradient-to-r from-[#FE5D5C] to-[#E53E3E] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Saída
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo (opcional)</label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 p-2.5 text-gray-900"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#2D3345] to-[#4A5568] hover:from-[#4A5568] hover:to-[#2D3345] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#99E0FF] transition-all duration-300"
            >
              Registrar Movimentação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Stock;

