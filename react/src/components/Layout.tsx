import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../services/auth';
import { usersService } from '../services/users';
import { notificationService } from '../services/notification';
import { cryptoService } from '../services/crypto';
import { environment } from '../config/environment';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout: authLogout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = useMemo<NavLink[]>(() => {
    const links: NavLink[] = [
      { path: '/inicio', label: 'Início', icon: 'home' },
      { path: '/medicamentos', label: 'Medicamentos', icon: 'pill' },
      { path: '/categorias', label: 'Categorias', icon: 'tag' },
      { path: '/clientes', label: 'Clientes', icon: 'users' },
      { path: '/estoque', label: 'Estoque', icon: 'archive' },
    ];

    if (currentUser?.role === 'ADMIN') {
      links.push({ path: '/usuarios', label: 'Usuários', icon: 'user-circle' });
    }

    links.push({ path: '/vendas', label: 'Vendas', icon: 'cart' });

    if (currentUser?.role === 'ADMIN') {
      links.push({ path: '/logs', label: 'Logs', icon: 'clipboard' });
    }

    return links;
  }, [currentUser]);

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const navigateWithReload = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
    window.location.reload();
  };

  const onAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        uploadAvatar(file);
      }
    };
    input.click();
  };

  const uploadAvatar = async (file: File) => {
    if (!currentUser) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      notificationService.error('Formato Inválido', 'Por favor, selecione uma imagem JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notificationService.error('Arquivo muito grande', 'O arquivo deve ter no máximo 5MB.');
      return;
    }

    try {
      const updatedUser = await usersService.uploadAvatar(currentUser.id, file);
      useAuthStore.setState({ currentUser: updatedUser });
      const encryptedUser = cryptoService.encryptObject(updatedUser);
      localStorage.setItem('currentUser_enc', encryptedUser);
      notificationService.success('Avatar atualizado!', 'Seu avatar foi atualizado com sucesso.');
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      notificationService.error('Erro ao atualizar avatar', err.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    }
  };

  const getAvatarUrl = (): string | null => {
    if (!currentUser || !currentUser.avatarUrl) {
      return null;
    }
    if (currentUser.avatarUrl.startsWith('http')) {
      return currentUser.avatarUrl;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${currentUser.avatarUrl}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-[#2D3345] shadow-md sticky top-0 z-50 w-full overflow-x-hidden">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 max-w-full">
          <div className="flex items-center justify-between h-14 sm:h-16 min-w-0">
            {/* Logo and Brand Name */}
            <div className="flex-shrink-0 flex items-center md:ml-[44px]">
              <img className="h-8 sm:h-10 w-auto" src="/src/assets/logo.png" alt="Grupo DPSP Logo" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
              <span className="ml-2 sm:ml-4 md:ml-8 text-base sm:text-lg md:text-xl font-bold text-[#99E0FF] truncate">
                
              </span>
            </div>

            {/* Desktop Menu Links */}
            <div className="hidden md:flex flex-1 justify-center ml-8">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => navigateWithReload(link.path)}
                    className={`text-gray-200/90 hover:bg-gray-500/50 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isActiveRoute(link.path)
                        ? 'bg-[#FE5D5C] text-white font-bold'
                        : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-gray-600/50 inline-flex items-center justify-center p-2 rounded-lg text-gray-200 hover:text-white hover:bg-gray-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-white/50 transition-all duration-300"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#2D3345]/80">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => navigateWithReload(link.path)}
                  className={`text-gray-200/90 hover:bg-gray-500/50 hover:text-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 cursor-pointer ${
                    isActiveRoute(link.path)
                      ? 'bg-[#FE5D5C] text-white font-bold'
                      : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* Logout Button for Mobile */}
              <div className="pt-2 border-t border-gray-600 mt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-white bg-gradient-to-r from-[#FE5D5C]/90 to-[#E53E3E]/90 hover:from-[#FE5D5C] hover:to-[#E53E3E] transition-all duration-300 flex items-center justify-center font-medium shadow-md hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="flex w-full min-w-0">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-[#2D3345] min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] shadow-md flex-shrink-0">
          {/* User Info at Top */}
          <div className="p-6 border-b border-gray-500/50">
            {currentUser && (
              <div className="flex flex-col items-center">
                <div
                  onClick={onAvatarClick}
                  className="h-20 w-20 rounded-full bg-[#99E0FF] flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity relative group"
                  title="Clique para trocar o avatar"
                >
                  {getAvatarUrl() ? (
                    <img src={getAvatarUrl()!} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[#2D3345]">
                      {currentUser.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white font-medium text-lg">Bem vindo,</p>
                <p className="text-[#99E0FF] font-bold text-xl mt-1">{currentUser.nome}!</p>
                <p className="text-gray-300 text-sm mt-2">{currentUser.email}</p>
              </div>
            )}
          </div>

          {/* Sidebar Menu Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => navigateWithReload(link.path)}
                    className={`flex items-center px-4 py-3 text-gray-200/90 hover:bg-gray-500/50 hover:text-white rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isActiveRoute(link.path)
                        ? 'bg-[#FE5D5C] text-white font-bold'
                        : ''
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button at Bottom */}
          <div className="p-4 border-t border-gray-500/50">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg text-white bg-gradient-to-r from-[#FE5D5C]/90 to-[#E53E3E]/90 hover:from-[#FE5D5C] hover:to-[#E53E3E] transition-all duration-300 flex items-center justify-center font-medium shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden">
          <div className="p-3 sm:p-4 md:p-6 w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

