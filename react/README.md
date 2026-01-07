# Sistema de Farmácia DPSP - Frontend React

Este projeto foi convertido de Angular para React e está totalmente integrado com o backend Java.

## 🚀 Tecnologias

- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **React Router DOM** - Roteamento para aplicações React
- **Axios** - Cliente HTTP para requisições à API
- **Zustand** - Gerenciamento de estado leve
- **SweetAlert2** - Alertas e notificações
- **Crypto-JS** - Criptografia de dados sensíveis
- **Tailwind CSS** - Framework CSS utilitário (via CDN)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🔧 Configuração

O projeto está configurado para se conectar ao backend Java na porta `8081`. A URL da API está definida em `src/config/environment.ts`.

Para alterar a URL da API, você pode:
1. Modificar o arquivo `src/config/environment.ts`
2. Ou criar um arquivo `.env` na raiz do projeto com:
   ```
   VITE_API_URL=http://localhost:8081/api
   ```

## 📁 Estrutura do Projeto

```
react/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Layout.tsx     # Layout principal com sidebar e navbar
│   │   └── Modal.tsx      # Componente de modal
│   ├── config/            # Configurações
│   │   └── environment.ts # Variáveis de ambiente
│   ├── models/            # Tipos TypeScript
│   │   └── types.ts       # Interfaces e tipos
│   ├── pages/             # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   ├── Medicines.tsx
│   │   ├── Categories.tsx
│   │   ├── CategoryMedicines.tsx
│   │   ├── Customers.tsx
│   │   ├── Stock.tsx
│   │   ├── Sales.tsx
│   │   ├── Logs.tsx
│   │   └── Users.tsx
│   ├── services/           # Serviços de API
│   │   ├── api.ts         # Cliente Axios configurado
│   │   ├── auth.service.ts # Autenticação (Zustand)
│   │   ├── crypto.service.ts # Criptografia
│   │   ├── notification.service.ts # Notificações
│   │   ├── medicines.service.ts
│   │   ├── categories.service.ts
│   │   ├── customers.service.ts
│   │   ├── stock.service.ts
│   │   ├── sales.service.ts
│   │   ├── logs.service.ts
│   │   ├── alerts.service.ts
│   │   └── users.service.ts
│   ├── App.tsx            # Componente raiz com rotas
│   ├── main.tsx           # Ponto de entrada
│   └── index.css          # Estilos globais
├── index.html             # HTML principal
├── package.json           # Dependências
├── vite.config.ts         # Configuração do Vite
└── tsconfig.json          # Configuração TypeScript
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. O token é armazenado no `localStorage` e enviado automaticamente em todas as requisições através do interceptor do Axios.

### Guards de Rota

- **ProtectedRoute**: Protege rotas que requerem autenticação
- **AdminRoute**: Protege rotas que requerem permissão de administrador

## 🌐 Integração com Backend

Todas as requisições são feitas para `http://localhost:8081/api` (configurável via variável de ambiente).

### Endpoints Principais

- `/api/auth/login` - Autenticação
- `/api/medicamentos` - CRUD de medicamentos
- `/api/categorias` - CRUD de categorias
- `/api/clientes` - CRUD de clientes
- `/api/estoque` - Movimentações de estoque
- `/api/vendas` - Vendas
- `/api/logs` - Logs de auditoria
- `/api/usuarios` - CRUD de usuários
- `/api/alertas` - Alertas do sistema

## 🎨 Estilização

O projeto utiliza Tailwind CSS via CDN. Os estilos seguem o mesmo design do projeto Angular original, mantendo:
- Cores principais: `#2D3345`, `#99E0FF`, `#FE5D5C`
- Gradientes e sombras
- Layout responsivo

## 📝 Funcionalidades

- ✅ Autenticação e autorização
- ✅ Gerenciamento de medicamentos (CRUD)
- ✅ Gerenciamento de categorias (CRUD)
- ✅ Gerenciamento de clientes (CRUD)
- ✅ Controle de estoque (entradas e saídas)
- ✅ Sistema de vendas (carrinho e checkout)
- ✅ Logs de auditoria
- ✅ Gerenciamento de usuários
- ✅ Alertas de estoque baixo e validade
- ✅ Upload de imagens
- ✅ Criptografia de dados sensíveis

## 🚨 Notas Importantes

1. **Backend deve estar rodando**: Certifique-se de que o backend Java está rodando na porta 8081 antes de iniciar o frontend.

2. **CORS**: O backend deve estar configurado para aceitar requisições do frontend (normalmente na porta 4200 em desenvolvimento).

3. **Imagens**: As imagens são servidas pelo backend. Certifique-se de que o backend está configurado para servir arquivos estáticos.

4. **Token JWT**: O token JWT expira após 24 horas (86400000ms). O usuário precisará fazer login novamente após a expiração.

## 🔄 Migração do Angular

Este projeto foi completamente convertido de Angular para React, mantendo todas as funcionalidades:

- Componentes Angular → Componentes React funcionais
- Services Angular → Services JavaScript/TypeScript
- Guards Angular → Componentes de proteção de rotas
- RxJS Observables → Promises/async-await
- Signals Angular → useState/useMemo do React
- Dependency Injection → Imports diretos

## 📄 Licença

Este projeto é privado e pertence ao Grupo DPSP.

