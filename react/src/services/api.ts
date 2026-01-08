import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { environment } from '../config/environment';

const api: AxiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação e ajustar Content-Type
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && !config.url?.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Se o payload for FormData, remove o Content-Type para deixar o navegador definir automaticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔴 INTERCEPTOR: Erro capturado', {
      status: error.response?.status,
      url: error.config?.url,
      isLoginEndpoint: error.config?.url?.includes('/auth/login')
    });
    
    // Não redireciona se o erro 401 for no próprio endpoint de login
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('🚫 401 em endpoint autenticado - redirecionando para login');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('currentUser_enc');
      window.location.href = '/login';
    } else if (error.response?.status === 401 && error.config?.url?.includes('/auth/login')) {
      console.log('🚫 401 no login - NÃO redirecionando, deixando componente tratar');
      console.log('🔴 INTERCEPTOR: Propagando erro para o componente...');
    }
    
    console.log('🔴 INTERCEPTOR: Promise.reject será chamado agora');
    return Promise.reject(error);
  }
);

export default api;

