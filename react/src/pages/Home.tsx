import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/auth';
import { alertsService } from '../services/alerts';
import { notificationService } from '../services/notification';
import { Alert } from '../models/types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [lowStockAlerts, setLowStockAlerts] = useState<Alert[]>([]);
  const [expiringSoonAlerts, setExpiringSoonAlerts] = useState<Alert[]>([]);
  const [expiredAlerts, setExpiredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gerarEcarregarAlertas();
  }, []);

  const gerarEcarregarAlertas = async () => {
    try {
      await alertsService.gerarAlertas();
      loadAlerts();
    } catch (err) {
      console.error('Error generating alerts:', err);
      loadAlerts();
    }
  };

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const [lowStock, expiringSoon, expired] = await Promise.all([
        alertsService.getEstoqueBaixo(),
        alertsService.getValidadeProxima(),
        alertsService.getValidadeVencida(),
      ]);
      setLowStockAlerts(lowStock);
      setExpiringSoonAlerts(expiringSoon);
      setExpiredAlerts(expired);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const marcarComoVisto = async (alerta: Alert) => {
    try {
      await alertsService.marcarComoLido(alerta.id);
      notificationService.success('Alerta marcado como visto', 'O alerta foi removido do painel.');
      
      if (alerta.tipo === 'ESTOQUE_BAIXO') {
        setLowStockAlerts((prev) => prev.filter((a) => a.id !== alerta.id));
      } else if (alerta.tipo === 'VALIDADE_PROXIMA') {
        setExpiringSoonAlerts((prev) => prev.filter((a) => a.id !== alerta.id));
      } else if (alerta.tipo === 'VALIDADE_VENCIDA') {
        setExpiredAlerts((prev) => prev.filter((a) => a.id !== alerta.id));
      }
    } catch (err) {
      console.error('Error marking alert as read:', err);
      notificationService.error('Erro', 'Não foi possível marcar o alerta como visto.');
    }
  };

  const navegarParaEstoque = (medicamentoId: string) => {
    navigate('/estoque', { state: { medicamento: medicamentoId } });
  };

  const navegarParaMedicamento = (medicamentoId: string) => {
    navigate('/medicamentos', { state: { id: medicamentoId } });
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full">
      <header className="w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D3345] to-[#4A5568]">
          Painel de Controle
        </h1>
        {currentUser && (
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1">
            Olá, {currentUser.nome}. Aqui está um resumo do sistema.
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D3345] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando alertas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
          {/* Low Stock Alerts Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-red-400 to-[#FE5D5C]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="ml-4 text-2xl font-semibold text-[#2D3345]">Alerta de Estoque Baixo</h2>
            </div>
            <div className="mt-4">
              {lowStockAlerts.length > 0 ? (
                <ul className="space-y-3">
                  {lowStockAlerts.map((alerta) => (
                    <li
                      key={alerta.id}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer group"
                      onClick={() => navegarParaEstoque(alerta.medicamentoId)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{alerta.medicamentoNome}</span>
                          <span className="text-sm font-semibold text-red-800">{alerta.mensagem}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoVisto(alerta);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-200 hover:bg-red-300 rounded-md transition-colors"
                          title="Marcar como visto"
                        >
                          ✓ Visto
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4 text-center p-4 bg-green-50 rounded-lg">
                  Nenhum medicamento com estoque baixo. Ótimo trabalho!
                </p>
              )}
            </div>
          </div>

          {/* Expiring Soon Alerts Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="ml-4 text-2xl font-semibold text-[#2D3345]">Alerta de Validade Próxima</h2>
            </div>
            <div className="mt-4">
              {expiringSoonAlerts.length > 0 ? (
                <ul className="space-y-3">
                  {expiringSoonAlerts.map((alerta) => (
                    <li
                      key={alerta.id}
                      className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer group"
                      onClick={() => navegarParaMedicamento(alerta.medicamentoId)}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 block">{alerta.medicamentoNome}</span>
                        <span className="text-sm text-gray-600">{alerta.mensagem}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoVisto(alerta);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-200 hover:bg-yellow-300 rounded-md transition-colors"
                          title="Marcar como visto"
                        >
                          ✓ Visto
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4 text-center p-4 bg-green-50 rounded-lg">
                  Nenhum medicamento com validade próxima.
                </p>
              )}
            </div>
          </div>

          {/* Expired Alerts Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="ml-4 text-2xl font-semibold text-[#2D3345]">Alerta de Validade Vencida</h2>
            </div>
            <div className="mt-4">
              {expiredAlerts.length > 0 ? (
                <ul className="space-y-3">
                  {expiredAlerts.map((alerta) => (
                    <li
                      key={alerta.id}
                      className="flex justify-between items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer group"
                      onClick={() => navegarParaMedicamento(alerta.medicamentoId)}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 block">{alerta.medicamentoNome}</span>
                        <span className="text-sm text-gray-600">{alerta.mensagem}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoVisto(alerta);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-200 hover:bg-orange-300 rounded-md transition-colors"
                          title="Marcar como visto"
                        >
                          ✓ Visto
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4 text-center p-4 bg-green-50 rounded-lg">
                  Nenhum medicamento vencido.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

