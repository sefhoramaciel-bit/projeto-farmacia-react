import React, { useState, useEffect } from 'react';
import { logsService } from '../services/logs';
import { notificationService } from '../services/notification';
import { Log } from '../models/types';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, logs]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await logsService.getUltimos100();
      setLogs(data);
    } catch (err) {
      console.error('Error loading logs:', err);
      notificationService.error('Erro', 'Não foi possível carregar os logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await logsService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notificationService.success('Exportação Concluída', 'Arquivo CSV baixado com sucesso!');
    } catch (err) {
      console.error('Error exporting logs:', err);
      notificationService.error('Erro', 'Não foi possível exportar os logs.');
    } finally {
      setIsExporting(false);
    }
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredLogs(logs);
      return;
    }
    const filtered = logs.filter(log => 
      log.tipoOperacao?.toLowerCase().includes(term) ||
      log.tipoEntidade?.toLowerCase().includes(term) ||
      log.descricao?.toLowerCase().includes(term) ||
      log.usuarioNome?.toLowerCase().includes(term) ||
      log.usuarioEmail?.toLowerCase().includes(term) ||
      log.entidadeId?.toLowerCase().includes(term) ||
      log.id?.toLowerCase().includes(term)
    );
    setFilteredLogs(filtered);
  };

  const formatDetalhes = (log: Log): string => {
    if (!log.detalhes) return '';
    if (log.tipoEntidade === 'Venda' || log.tipoEntidade === 'VENDA') {
      try {
        const detalhes = JSON.parse(log.detalhes);
        const partes: string[] = [];
        
        // Informações do cliente
        if (detalhes.clienteId !== undefined) {
          partes.push(`Cliente ID: ${detalhes.clienteId}`);
        }
        if (detalhes.clienteNome !== undefined) {
          partes.push(`Cliente: ${detalhes.clienteNome}`);
        }
        if (detalhes.clienteCpf !== undefined) {
          partes.push(`CPF: ${detalhes.clienteCpf}`);
        }
        
        // Data e hora
        if (detalhes.data !== undefined) {
          partes.push(`Data/Hora: ${detalhes.data}`);
        }
        
        // Status
        if (detalhes.status !== undefined) {
          const statusMap: { [key: string]: string } = {
            'CONCLUIDA': 'Concluída',
            'CANCELADA': 'Cancelada',
            'PENDENTE': 'Pendente'
          };
          partes.push(`Status: ${statusMap[detalhes.status] || detalhes.status}`);
        }
        
        // Valor total
        if (detalhes.valorTotal !== undefined) {
          partes.push(`Valor Total: R$ ${Number(detalhes.valorTotal).toFixed(2).replace('.', ',')}`);
        }
        
        // Itens da venda
        if (detalhes.itens && Array.isArray(detalhes.itens) && detalhes.itens.length > 0) {
          detalhes.itens.forEach((item: any, index: number) => {
            if (index > 0) partes.push('');
            partes.push(`Item ${index + 1}: ${item.medicamentoNome || 'N/A'}`);
            if (item.quantidade !== undefined) partes.push(`  • Quantidade: ${item.quantidade}`);
            if (item.precoUnitario !== undefined) partes.push(`  • Valor Unitário: R$ ${Number(item.precoUnitario).toFixed(2).replace('.', ',')}`);
            if (item.subtotal !== undefined) partes.push(`  • Subtotal: R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}`);
          });
        }
        return partes.join('\n');
      } catch {
        return log.detalhes;
      }
    }
    return log.detalhes;
  };

  const getBadgeClass = (tipo: string): string => {
    const classes: { [key: string]: string } = {
      'Criação': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
      'Atualização': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800',
      'Exclusão': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800',
      'Login': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800',
      'Logout': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800',
      'Reativação': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800',
      'Movimentação': 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800',
    };
    return classes[tipo] || 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568] leading-normal">
            Logs de Auditoria
          </h1>
          <p className="text-lg text-gray-600">Visualize os últimos 100 registros de atividades no sistema.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={isExporting}
          className="mt-4 md:mt-0 flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-[#2D3345] hover:bg-[#3a4258] hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Exportar para CSV</span>
            </>
          )}
        </button>
      </header>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tipo, entidade, usuário, descrição ou ID..."
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
          <div className="p-8 text-center text-gray-500">Carregando logs...</div>
        ) : (
          <>
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Exibindo <span className="font-semibold text-gray-800">{filteredLogs.length}</span> de{' '}
                <span className="font-semibold text-gray-800">{logs.length}</span> logs (últimos 100 registros)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? `Nenhum log encontrado para "${searchTerm}".` : 'Nenhum registro de log encontrado.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.dataHora || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.usuarioNome}</div>
                          <div className="text-sm text-gray-500">{log.usuarioEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getBadgeClass(log.tipoOperacao)}>{log.tipoOperacao}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.tipoEntidade}</td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-md">
                          <div>{log.descricao}</div>
                          {log.detalhes && (
                            <div className="mt-1 text-xs text-gray-600 whitespace-pre-line">
                              {formatDetalhes(log)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;

