# Starkin Finance 🚀

**Starkin Finance** é uma aplicação web de gestão financeira pessoal moderna, desenvolvida com foco em alta performance, design premium (Glassmorphism) e uma arquitetura escalável orientada a funcionalidades (*Feature-Driven*).

![Dashboard Preview](https://via.placeholder.com/1200x600/0f172a/ffffff?text=Starkin+Finance+Dashboard) *<!-- Substitua pela imagem real do projeto se disponível -->*

## ✨ Funcionalidades

- **💼 Gestão de Ganhos**: Controle todas as suas entradas de capital de forma organizada.
- **📌 Gastos Fixos**: Acompanhe suas contas mensais recorrentes com status de pagamento (Pago/Pendente).
- **🛍️ Gastos Variáveis**: Registre despesas pontuais do dia a dia com categorização rápida.
- **🗓️ Parcelamentos**: Controle compras parceladas com projeção automática nos meses futuros.
- **🏷️ Categorias Personalizadas**: Organize suas finanças com categorias coloridas.
- **📊 Visão Mensal**: Filtros inteligentes por mês e ano para análise histórica.
- **🌓 Design Premium**: Interface em Dark Mode com efeitos de Glassmorphism e animações suaves via Framer Motion.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Gerenciamento de Estado de Dados**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Ícones**: [Lucide React](https://lucide.dev/)

## 📂 Estrutura do Projeto

O projeto utiliza uma arquitetura **Feature-Driven Architecture**, onde cada funcionalidade importante reside em seu próprio diretório dentro de `src/features/`:

```bash
src/
├── components/      # Componentes globais (Button, Input, Layout)
├── contexts/        # Contextos compartilhados (ex: MonthContext)
├── features/        # Módulos isolados por funcionalidade
│   ├── auth/        # Login e autenticação
│   ├── expenses/    # Gastos Fixos e Variáveis (hooks, types, pages)
│   ├── income/      # Entradas/Receitas
│   ├── installments/ # Parcelamentos e projeções
│   └── dashboard/   # Visão geral e métricas
├── lib/             # Configurações de bibliotecas (Supabase client)
└── hooks/           # Hooks utilitários globais
```

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js (v18+)
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/starkinfinance.git
   cd starkinfinance
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto com as suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_projecto
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Build para Produção**:
   ```bash
   npm run build
   ```

---
