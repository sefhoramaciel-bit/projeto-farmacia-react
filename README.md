# 🏥 Sistema de Gestão de Farmácia - Full Stack

## 📌 Visão Geral

Sistema completo de gestão de farmácia desenvolvido com arquitetura **Full Stack**, utilizando **React 18** com **TypeScript** no frontend e **Spring Boot 3.2.0** no backend. O sistema oferece uma solução robusta para gerenciamento de medicamentos, clientes, vendas, estoque, categorias, usuários e auditoria, com controle de acesso baseado em roles (ADMIN e VENDEDOR).

---

## 🎯 Principais Características

- ✅ **Autenticação JWT** com controle de acesso baseado em perfis
- ✅ **Gestão completa de Medicamentos** com upload de múltiplas imagens
- ✅ **Sistema de Alertas** automático (estoque baixo, validade próxima/vencida)
- ✅ **Ponto de Venda** completo com carrinho de compras
- ✅ **Controle de Estoque** com histórico de movimentações
- ✅ **Auditoria completa** com logs de todas as operações
- ✅ **Interface moderna e responsiva** com TailwindCSS
- ✅ **Validações em múltiplas camadas** (Frontend e Backend)
- ✅ **Soft Delete** para preservação de dados históricos
- ✅ **Criptografia de dados sensíveis** no armazenamento local

---

## 🏗️ Arquitetura do Projeto

```
projeto-farmacia-react/
├── react/                          # Aplicação React
│   ├── src/
│   │   ├── pages/                  # Páginas da aplicação
│   │   │   ├── Login.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Medicines.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Sales.tsx
│   │   │   ├── Stock.tsx
│   │   │   ├── Users.tsx
│   │   │   └── Logs.tsx
│   │   ├── components/             # Componentes reutilizáveis
│   │   │   ├── Layout.tsx
│   │   │   └── Modal.tsx
│   │   ├── services/               # Serviços de API
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── medicines.ts
│   │   │   ├── categories.ts
│   │   │   ├── customers.ts
│   │   │   ├── sales.ts
│   │   │   ├── stock.ts
│   │   │   ├── users.ts
│   │   │   ├── alerts.ts
│   │   │   ├── logs.ts
│   │   │   ├── notification.ts
│   │   │   └── crypto.ts
│   │   ├── models/                 # Tipos TypeScript
│   │   │   └── types.ts
│   │   ├── config/                 # Configurações
│   │   │   └── environment.ts
│   │   ├── assets/                 # Recursos estáticos
│   │   ├── App.tsx                 # Componente raiz
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Estilos globais
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── java/                           # Aplicação Spring Boot
    ├── src/main/java/com/farmacia/
    │   ├── controller/             # REST Controllers
    │   ├── service/                # Lógica de negócio
    │   ├── repository/             # JPA Repositories
    │   ├── domain/                 # Entidades, DTOs, Enums
    │   │   ├── entity/
    │   │   ├── dto/
    │   │   └── enums/
    │   ├── config/                 # Configurações Spring
    │   ├── security/               # Segurança JWT
    │   └── exception/              # Tratamento de exceções
    ├── src/main/resources/
    │   ├── db/migration/           # Scripts Flyway
    │   └── application.yml         # Configurações
    └── pom.xml
```

---

## 🚀 Tecnologias Utilizadas

### Frontend (React)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 18.3.1 | Framework JavaScript |
| **TypeScript** | 5.6.3 | Linguagem tipada |
| **Vite** | 6.0.1 | Build tool e dev server |
| **React Router DOM** | 6.26.0 | Roteamento |
| **Axios** | 1.7.7 | Cliente HTTP |
| **Zustand** | 4.5.5 | Gerenciamento de estado |
| **SweetAlert2** | 11.26.17 | Notificações e modais |
| **Crypto-JS** | 4.2.0 | Criptografia de dados |
| **TailwindCSS** | latest | Framework CSS utilitário |

**Características do Frontend:**
- ✅ **React com TypeScript** para type safety
- ✅ **Zustand** para gerenciamento de estado global simples e eficiente
- ✅ **React Router** com proteção de rotas (ProtectedRoute, AdminRoute)
- ✅ **Axios Interceptors** para autenticação automática
- ✅ **Componentes funcionais** com Hooks
- ✅ **Design responsivo** com TailwindCSS
- ✅ **Validações de formulário** em tempo real
- ✅ **Upload de imagens** com preview
- ✅ **Criptografia local** de dados sensíveis

### Backend (Spring Boot)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Spring Boot** | 3.2.0 | Framework principal |
| **Java** | 17 | Linguagem de programação |
| **Spring Security** | 3.2.0 | Autenticação e autorização |
| **Spring Data JPA** | 3.2.0 | Persistência de dados |
| **PostgreSQL** | - | Banco de dados relacional |
| **Flyway** | - | Migração de banco de dados |
| **JWT (JJWT)** | 0.12.3 | Tokens de autenticação |
| **Lombok** | 1.18.32 | Redução de boilerplate |
| **MapStruct** | 1.5.5 | Mapeamento de objetos |
| **Swagger/OpenAPI** | 2.3.0 | Documentação da API |
| **Maven** | - | Gerenciamento de dependências |

**Características do Backend:**
- ✅ **RESTful API** com endpoints padronizados
- ✅ **JWT Authentication** com tokens stateless
- ✅ **Role-Based Access Control (RBAC)** com @PreAuthorize
- ✅ **Transactional Management** para consistência de dados
- ✅ **Exception Handling** global com GlobalExceptionHandler
- ✅ **File Upload** para imagens (máx 5MB, múltiplas imagens)
- ✅ **Scheduled Tasks** para alertas automáticos
- ✅ **Audit Logging** completo de todas as operações
- ✅ **Flyway Migrations** para versionamento do banco
- ✅ **Swagger UI** para documentação interativa

---

## 🔒 Segurança

### Autenticação

- **JWT Tokens**: Tokens stateless com expiração de 24 horas
- **BCrypt**: Hash de senhas com BCrypt (força 10)
- **Criptografia Local**: Dados sensíveis criptografados no localStorage usando Crypto-JS AES
- **Token Refresh**: Sistema de renovação automática de tokens

### Autorização

**Role-Based Access Control (RBAC)**:
- **ADMIN**: Acesso completo ao sistema
  - Gerenciar medicamentos, categorias, clientes
  - Gerenciar usuários
  - Visualizar logs de auditoria
  - Realizar vendas e controlar estoque
  
- **VENDEDOR**: Acesso limitado
  - Visualizar medicamentos, categorias e clientes (read-only)
  - Realizar vendas e controlar estoque
  - Visualizar alertas
  - Alterar apenas seu próprio avatar

**Implementação:**
- Backend: `@PreAuthorize("hasRole('ADMIN')")` / `@PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")`
- Frontend: `AdminRoute` component para proteção de rotas
- Interceptors: Adição automática de token JWT em todas as requisições

### Validações

**Backend (Bean Validation)**:
- `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Positive`, `@Min`, `@Future`
- Validações customizadas de negócio

**Frontend (React)**:
- Validações em tempo real
- Mensagens específicas para cada campo
- Prevenção de envio de formulários inválidos

---

## 🗄️ Banco de Dados

### PostgreSQL

**Configuração:**
- **Banco**: `farmacia_db`
- **Porta**: 5432
- **Timezone**: America/Sao_Paulo
- **Usuário**: postgres
- **Senha**: (configurável em application.yml)

### Migrações (Flyway)

As migrações são executadas automaticamente na inicialização:

1. `V1__create_tables.sql` - Criação das tabelas principais
2. `V2__add_imagens_medicamento.sql` - Suporte a múltiplas imagens
3. `V3__add_data_nascimento_cliente.sql` - Campo data de nascimento
4. `V4__add_estoque_total_movimentacoes.sql` - Tabela de movimentações
5. `V5__create_logs_table.sql` - Tabela de logs de auditoria
6. `V6__add_descricao_medicamento.sql` - Campo descrição em medicamentos

### Entidades Principais

#### 1. **usuarios**
- `id` (UUID)
- `nome` (VARCHAR, NOT NULL)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password` (VARCHAR, NOT NULL) - Hash BCrypt
- `role` (ENUM: ADMIN, VENDEDOR)
- `avatar_url` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. **categorias**
- `id` (UUID)
- `nome` (VARCHAR, UNIQUE, NOT NULL)

#### 3. **medicamentos**
- `id` (UUID)
- `nome` (VARCHAR, UNIQUE, NOT NULL)
- `descricao` (TEXT)
- `preco` (DECIMAL, NOT NULL)
- `quantidade_estoque` (INTEGER, NOT NULL)
- `validade` (DATE, NOT NULL)
- `ativo` (BOOLEAN, DEFAULT TRUE)
- `categoria_id` (UUID, FK)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 4. **medicamento_imagens**
- `id` (UUID)
- `medicamento_id` (UUID, FK)
- `url_imagem` (VARCHAR, NOT NULL)
- `ordem` (INTEGER)

#### 5. **clientes**
- `id` (UUID)
- `nome` (VARCHAR, NOT NULL)
- `cpf` (VARCHAR, UNIQUE, NOT NULL)
- `email` (VARCHAR, NOT NULL)
- `data_nascimento` (DATE, NOT NULL)

#### 6. **vendas**
- `id` (UUID)
- `cliente_id` (UUID, FK)
- `usuario_id` (UUID, FK)
- `data_venda` (TIMESTAMP, NOT NULL)
- `valor_total` (DECIMAL, NOT NULL)
- `status` (ENUM: CONCLUIDA, CANCELADA)

#### 7. **itens_venda**
- `id` (UUID)
- `venda_id` (UUID, FK)
- `medicamento_id` (UUID, FK)
- `quantidade` (INTEGER, NOT NULL)
- `preco_unitario` (DECIMAL, NOT NULL)
- `subtotal` (DECIMAL, NOT NULL)

#### 8. **movimentacoes_estoque**
- `id` (UUID)
- `medicamento_id` (UUID, FK)
- `tipo` (ENUM: ENTRADA, SAIDA)
- `quantidade` (INTEGER, NOT NULL)
- `motivo` (VARCHAR)
- `usuario_id` (UUID, FK)
- `data_movimentacao` (TIMESTAMP, NOT NULL)

#### 9. **alertas**
- `id` (UUID)
- `tipo` (ENUM: ESTOQUE_BAIXO, VALIDADE_PROXIMA, VALIDADE_VENCIDA)
- `medicamento_id` (UUID, FK)
- `mensagem` (VARCHAR, NOT NULL)
- `lido` (BOOLEAN, DEFAULT FALSE)
- `data_geracao` (TIMESTAMP, NOT NULL)

#### 10. **logs**
- `id` (UUID)
- `usuario_id` (UUID, FK)
- `acao` (VARCHAR, NOT NULL) - Ex: "LOGIN", "VENDA_CRIADA", "MEDICAMENTO_ATUALIZADO"
- `entidade` (VARCHAR) - Nome da entidade afetada
- `entidade_id` (UUID) - ID da entidade afetada
- `detalhes` (TEXT) - JSON com dados completos
- `data` (TIMESTAMP, NOT NULL)

---

## 📦 Módulos e Funcionalidades

### 1. 🔐 Autenticação

**Funcionalidades:**
- Login com email e senha
- Geração de JWT token
- Armazenamento seguro (criptografado) no localStorage
- Logout com limpeza de dados
- Proteção de rotas automática
- Exibição de avatar do usuário logado

**Endpoints:**
- `POST /api/auth/login` - Autenticar usuário

### 2. 💊 Gestão de Medicamentos

**Funcionalidades:**
- CRUD completo
- Upload de 1 a 3 imagens por medicamento
- Visualização em cards com carrossel de imagens
- Ativação/Inativação (soft delete)
- Filtro por status (Ativos/Inativos)
- Busca por nome, descrição, categoria ou ID
- Validações:
  - Nome obrigatório e único
  - Preço > 0
  - Quantidade estoque >= 0
  - Data de validade futura
  - Categoria obrigatória

**Permissões:**
- ADMIN: Criar, editar, excluir, ativar/inativar
- VENDEDOR: Apenas visualização

### 3. 📁 Gestão de Categorias

**Funcionalidades:**
- CRUD completo
- Visualização de medicamentos por categoria
- Busca por nome
- Validação: nome obrigatório e único

**Permissões:**
- ADMIN: Criar, editar, excluir
- VENDEDOR: Apenas visualização e acesso aos medicamentos da categoria

### 4. 👥 Gestão de Clientes

**Funcionalidades:**
- CRUD completo
- Busca por nome, CPF, email ou ID
- Validações:
  - Nome obrigatório
  - CPF obrigatório e único
  - Email válido e obrigatório
  - Data de nascimento obrigatória

**Permissões:**
- ADMIN: Criar, editar, excluir
- VENDEDOR: Apenas visualização

### 5. 🛒 Ponto de Venda (Vendas)

**Funcionalidades:**
- Busca de cliente por CPF
- Carregamento automático de medicamentos válidos
- Carrinho de compras com:
  - Adicionar/remover itens
  - Ajustar quantidades
  - Cálculo automático de total
- Finalização de venda:
  - Redução de estoque
  - Registro em logs
- Cancelamento de venda:
  - Restauração de estoque
  - Registro em logs
- Filtros automáticos:
  - Apenas medicamentos ativos
  - Apenas não vencidos
  - Apenas com estoque disponível

**Permissões:**
- ADMIN e VENDEDOR: Acesso completo

### 6. 📦 Controle de Estoque

**Funcionalidades:**
- Entrada de estoque (adicionar quantidade)
- Saída de estoque (remover quantidade)
- Histórico de movimentações
- Validações:
  - Quantidade > 0
  - Estoque suficiente para saída
  - Motivo da movimentação

**Permissões:**
- ADMIN e VENDEDOR: Acesso completo

### 7. 🚨 Sistema de Alertas

**Funcionalidades:**
- **Alerta de Estoque Baixo**: Estoque <= 10 unidades
- **Alerta de Validade Próxima**: Vence em até 30 dias
- **Alerta de Validade Vencida**: Medicamentos já vencidos
- Geração automática diária (8h)
- Marcação como "visto"
- Reaparição automática se condição persistir
- Contadores por tipo de alerta na Home

**Permissões:**
- ADMIN e VENDEDOR: Visualização e marcação

### 8. 📊 Logs de Auditoria

**Funcionalidades:**
- Registro automático de todas as operações
- Detalhes completos em JSON:
  - Usuário responsável
  - Data e hora (formato brasileiro)
  - Entidade afetada
  - Dados da operação
- Exibição dos últimos 100 logs
- Exportação CSV completa
- Informações de vendas:
  - Cliente, itens, quantidades, valores

**Permissões:**
- ADMIN: Acesso completo

### 9. 👤 Gestão de Usuários

**Funcionalidades:**
- CRUD completo
- Upload de avatar (opcional)
- Preview de imagem antes de salvar
- Validações:
  - Nome obrigatório
  - Email único e válido
  - Senha >= 6 caracteres
  - Perfil obrigatório
- Busca por nome, email, perfil ou ID

**Permissões:**
- ADMIN: Gerenciar todos os usuários e avatares
- VENDEDOR: Alterar apenas seu próprio avatar

---

## 🚀 Configuração e Execução

### Pré-requisitos

- **Node.js**: 18+ (recomendado: 20+)
- **Java**: 17+
- **PostgreSQL**: 12+ (recomendado: 15+)
- **Maven**: Incluído no projeto (Maven Wrapper)

### 1. Configurar Banco de Dados

```sql
-- Criar banco de dados
CREATE DATABASE farmacia_db;

-- O Flyway executará as migrações automaticamente na primeira inicialização
```

### 2. Configurar Backend (Spring Boot)

**Editar configurações (opcional):**

```yaml
# java/src/main/resources/application.yml

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/farmacia_db
    username: postgres
    password: SUA_SENHA_AQUI
```

**Executar:**

Windows:
```bash
cd java
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Linux/macOS:
```bash
cd java
./mvnw clean install
./mvnw spring-boot:run
```

**Porta padrão:** `http://localhost:8081`

**Swagger:** `http://localhost:8081/swagger-ui.html`

### 3. Configurar Frontend (React)

**Instalar dependências:**

```bash
cd react
npm install
```

**Configurar variáveis de ambiente (opcional):**

Criar arquivo `.env` na pasta `react`:

```env
VITE_API_URL=http://localhost:8081/api
```

**Executar em desenvolvimento:**

```bash
npm run dev
```

**Build para produção:**

```bash
npm run build
npm run preview
```

**Porta padrão:** `http://localhost:5173`

### 4. Usuário Padrão

Ao iniciar o backend pela primeira vez, um usuário administrador é criado automaticamente:

- **Email**: `admin@farmacia.com`
- **Senha**: `admin123`
- **Perfil**: `ADMIN`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro acesso!

---

## 🎨 Interface do Usuário

### Design System

**Cores Principais:**
- Navbar/Sidebar: `#2D3345`
- Gradientes de botões: `#2D3345` → `#4A5568`
- Alertas de estoque: `#99E0FF`
- Ações destrutivas: `#FE5D5C`

**Características:**
- Design responsivo com TailwindCSS
- Menu lateral retrátil
- Modais para formulários
- Notificações com SweetAlert2
- Carrosséis de imagens
- Cards informativos
- Badges de status
- Ícones SVG inline

---

## 📡 API REST

### Padrões de Resposta

- **200 OK**: Operação bem-sucedida
- **201 Created**: Recurso criado
- **400 Bad Request**: Erro de validação
- **401 Unauthorized**: Não autenticado
- **403 Forbidden**: Sem permissão
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro do servidor

### Principais Endpoints

#### Autenticação
- `POST /api/auth/login` - Login

#### Medicamentos
- `GET /api/medicamentos` - Listar todos
- `GET /api/medicamentos/{id}` - Buscar por ID
- `GET /api/medicamentos/ativos` - Listar ativos
- `POST /api/medicamentos` - Criar (multipart/form-data)
- `PUT /api/medicamentos/{id}` - Atualizar (multipart/form-data)
- `PATCH /api/medicamentos/{id}/status` - Ativar/Inativar
- `DELETE /api/medicamentos/{id}` - Excluir

#### Categorias
- `GET /api/categorias` - Listar todas
- `GET /api/categorias/{id}` - Buscar por ID
- `GET /api/categorias/{id}/medicamentos` - Medicamentos da categoria
- `POST /api/categorias` - Criar
- `PUT /api/categorias/{id}` - Atualizar
- `DELETE /api/categorias/{id}` - Excluir

#### Clientes
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/{id}` - Buscar por ID
- `GET /api/clientes/cpf/{cpf}` - Buscar por CPF
- `POST /api/clientes` - Criar
- `PUT /api/clientes/{id}` - Atualizar
- `DELETE /api/clientes/{id}` - Excluir

#### Vendas
- `GET /api/vendas` - Listar todas
- `GET /api/vendas/{id}` - Buscar por ID
- `POST /api/vendas` - Criar venda
- `POST /api/vendas/cancelada` - Criar venda cancelada
- `POST /api/vendas/{id}/cancelar` - Cancelar venda existente

#### Estoque
- `POST /api/estoque/entrada` - Entrada de estoque
- `POST /api/estoque/saida` - Saída de estoque
- `GET /api/estoque/movimentacoes` - Histórico

#### Alertas
- `GET /api/alertas` - Listar todos
- `GET /api/alertas/nao-lidos` - Não lidos
- `GET /api/alertas/estoque-baixo` - Estoque baixo
- `GET /api/alertas/validade-proxima` - Validade próxima
- `GET /api/alertas/validade-vencida` - Vencidos
- `PUT /api/alertas/{id}/ler` - Marcar como lido
- `POST /api/alertas/gerar` - Gerar alertas manualmente

#### Usuários
- `GET /api/usuarios` - Listar todos
- `GET /api/usuarios/{id}` - Buscar por ID
- `POST /api/usuarios` - Criar (multipart/form-data)
- `PUT /api/usuarios/{id}` - Atualizar
- `POST /api/usuarios/{id}/avatar` - Upload de avatar
- `DELETE /api/usuarios/{id}` - Excluir

#### Logs
- `GET /api/logs/ultimos-100` - Últimos 100 logs
- `GET /api/logs/todos` - Todos os logs
- `GET /api/logs/exportar-csv` - Exportar CSV

---

## 🎯 Destaques Técnicos

### 1. Arquitetura Limpa
- Separação clara de responsabilidades
- Componentes reutilizáveis
- Serviços isolados
- State management centralizado

### 2. Segurança Robusta
- JWT stateless com expiração
- RBAC completo
- Criptografia de dados locais
- Validações em múltiplas camadas
- Proteção contra XSS e CSRF

### 3. Performance
- Vite para build ultrarrápido
- Lazy loading de páginas
- Otimização de imagens
- Interceptors para cache de autenticação

### 4. UX/UI Moderna
- Interface intuitiva e responsiva
- Feedback visual imediato
- Notificações claras e elegantes
- Validações em tempo real
- Carrosséis de imagens
- Modais centrados

### 5. Manutenibilidade
- TypeScript para type safety
- Código organizado e modular
- Padrões consistentes
- Documentação inline
- Swagger para API

---

## 📝 Scripts Disponíveis

### Frontend (React)

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (Vite)

# Build
npm run build            # Compila TypeScript e cria build de produção

# Preview
npm run preview          # Preview do build de produção
```

### Backend (Spring Boot)

```bash
# Windows
.\mvnw.cmd clean install     # Compilar projeto
.\mvnw.cmd spring-boot:run   # Executar aplicação
.\mvnw.cmd test              # Executar testes

# Linux/macOS
./mvnw clean install         # Compilar projeto
./mvnw spring-boot:run       # Executar aplicação
./mvnw test                  # Executar testes
```

---

## 🔮 Melhorias Futuras (Sugestões)

1. **Testes Automatizados**
   - Unit tests (Jest, React Testing Library)
   - Integration tests
   - E2E tests (Playwright, Cypress)

2. **Relatórios e Dashboards**
   - Gráficos de vendas
   - Análise de estoque
   - Relatórios em PDF

3. **Notificações em Tempo Real**
   - WebSockets para alertas
   - Notificações push

4. **PWA**
   - Service Workers
   - Modo offline
   - Instalação como app

5. **Integração de Pagamentos**
   - Múltiplas formas de pagamento
   - Controle de caixa

6. **Impressão de Comprovantes**
   - Recibos de venda
   - Etiquetas de medicamentos

---

## 📞 Informações Técnicas

### Versões
- **React**: 18.3.1
- **TypeScript**: 5.6.3
- **Vite**: 6.0.1
- **Spring Boot**: 3.2.0
- **Java**: 17
- **Node.js**: 18+ (recomendado)
- **PostgreSQL**: 12+ (recomendado)

### Portas
- **Frontend**: 5173 (Vite dev server)
- **Backend**: 8081
- **PostgreSQL**: 5432
- **Swagger UI**: 8081/swagger-ui.html

### Estrutura de Pastas de Upload
```
java/uploads/
├── avatars/          # Avatares de usuários
└── medicamentos/     # Imagens de medicamentos
```

---

## 📚 Documentação Adicional

- **Swagger UI**: `http://localhost:8081/swagger-ui.html`
- **API Docs**: `http://localhost:8081/v3/api-docs`
- **Flyway Migrations**: `java/src/main/resources/db/migration/`

---

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional e comercial.

---

**Desenvolvido com ❤️ para gestão eficiente de farmácias**

*Última atualização: Janeiro 2025*
