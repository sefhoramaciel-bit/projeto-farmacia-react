import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/auth';
import { notificationService } from '../services/notification';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@farmacia.com',
    password: 'admin123',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido.';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      notificationService.error('Formulário Inválido', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      if (response?.usuario) {
        notificationService.success('Login bem-sucedido!', `Bem-vindo, ${response.usuario.nome}!`);
        navigate('/inicio');
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        notificationService.error('Erro de Autenticação', 'Login ou Senha Não Identificados!');
      } else {
        notificationService.error('Erro no Servidor', 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 transform hover:scale-[1.02] transition-transform duration-500"
        style={{ background: '#2D3345' }}
      >
        <div className="text-center">
          <img className="mx-auto h-20 w-auto" src="/src/assets/logo.png" alt="Grupo DPSP Logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
          <h2 className="mt-4 text-3xl font-extrabold text-[#99E0FF] drop-shadow-md"></h2>
          <p className="mt-2 text-sm text-white/90">Bem-vindo de volta!</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border-2 border-gray-300/60 bg-white/90 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-[#99E0FF]/50 focus:border-[#99E0FF] focus:z-10 sm:text-sm transition-all duration-300"
                placeholder="Email"
              />
              {errors.email && (
                <div className="text-red-500 text-xs p-1 bg-white/80 rounded-b-md">{errors.email}</div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border-2 border-gray-300/60 bg-white/90 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#99E0FF]/50 focus:border-[#99E0FF] focus:z-10 sm:text-sm transition-all duration-300"
                placeholder="Senha"
              />
              {errors.password && (
                <div className="text-red-500 text-xs p-1 bg-white/80 rounded-b-md">{errors.password}</div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-[#2D3345] bg-[#99E0FF]/90 hover:bg-[#99E0FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#99E0FF]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#2D3345]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

