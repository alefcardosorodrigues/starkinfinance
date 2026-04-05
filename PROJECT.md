-- backend
Backend API Starkin Finance (Node.js + Supabase)
Contexto do Projeto: O Starkin Finance é um ecossistema de gestão financeira que visa reduzir a taxa de abandono de 68% comum no setor, focando em automação e clareza absoluta
. O sistema deve mitigar a taxa de erro de 10-15% das entradas manuais e resolver o "vácuo contextual" (mensagens de erro vagas) fornecendo logs e feedbacks claros
.
1. Arquitetura e Stack
Linguagem: Node.js (TypeScript recomendado para segurança de dados financeiros).
Banco de Dados & Auth: Supabase (PostgreSQL) com Row Level Security (RLS) habilitado.
Segurança: Criptografia AES-256 para campos sensíveis e autenticação via JWT
.
2. Modelagem de Dados (Schema Supabase)
Crie as seguintes tabelas e relacionamentos:
profiles: id (uuid, PK), email, display_name, avatar_url, monthly_income_goal.
categories: id, name (ex: Casa, Lazer, Uber
), type (Essencial/Desejo), icon, color_hex.
entries (Entradas): id, user_id (FK), description, amount, date, type (Salário, Renda Extra, Vale Refeição
).
fixed_expenses: id, user_id (FK), name, amount, due_day, is_paid (bool), category_id (FK).
variable_expenses: id, user_id (FK), name, amount, date, category_id (FK), payment_method (Pix, Nubank, Bradesco
), notes.
installments (Parcelamentos): id, user_id (FK), description, total_installments, current_installment, installment_value, category_id (FK).
goals: id, user_id (FK), name, target_amount, current_amount, deadline.
investments: id, user_id (FK), type (FIIs, Ações, Cripto
), amount, destination.
3. Rotas da API (Endpoints REST)
Autenticação:
POST /auth/signup e POST /auth/login utilizando Supabase Auth.
Gestão Financeira:
GET/POST /entries: Gerenciar fluxos de entrada (Salários e Extras).
GET/POST /expenses/fixed: Listar e cadastrar gastos recorrentes com lógica de "Checklist de Pagamento"
.
GET/POST /expenses/variable: Cadastro de gastos do dia a dia. Incluir suporte para One-Tap Entry (atalhos para gastos frequentes como "Uber" ou "Pão Coroa"
).
PATCH /expenses/fixed/:id/pay: Marcar despesa fixa como paga.
Inteligência e Relatórios:
GET /dashboard/summary: Retornar JSON com:
Patrimônio Líquido: (Soma de Ativos - Soma de Dívidas)
.
Previsto vs. Executado: Comparação por categoria baseada na aba "Novembro" da planilha
.
Reserva de Emergência (Runway): Cálculo de quantos meses o saldo cobre as despesas essenciais
.
GET /dashboard/health-metrics: Retornar:
DTI (Dívida/Renda): Alerta se > 36%
.
Taxa de Poupança: % da renda investida (meta de 20%)
.
4. Lógica de Negócio Obrigatória (Edge Functions/Hooks)
Motor de Parcelamento: Ao criar uma variable_expense com parcelas, o sistema deve gerar automaticamente os registros de installments para os meses futuros (ex: "Passagem Brasília 03/08"
).
Validação de Orçamento Estourado: Sempre que Despesas Previstas > Entradas, retornar o alerta contextual: "O orçamento distribuído está maior que sua renda mensal! Reveja os limites!"
.
Projeção Anual: Sincronizar dados para alimentar uma visão anual (patrimônio líquido mês a mês) similar à aba "Visão anual"
.
5. Tratamento de Erros e Logs
Implementar o fechamento do "contextual gap": se uma transação falhar, a API deve retornar a causa raiz (ex: limite insuficiente, erro de integração) de forma legível para o usuário final
.


-- frontend


Frontend SPA Starkin Finance (React + Vite + Node.js)
Objetivo do Projeto: Criar uma Single Page Application (SPA) para o Starkin Finance. O foco é a "Fricção Zero" e a "Clareza Absoluta", respondendo instantaneamente à pergunta: "Onde está meu dinheiro agora?"
. O design deve seguir os princípios de Finanças Comportamentais, usando gatilhos visuais para reduzir a ansiedade financeira
.
1. Telas e Arquitetura de Navegação
Onboarding "Install & Go": Fluxo simplificado para definir o "Salário Base" e a "Meta de Patrimônio Líquido" para 2026, estabelecendo uma conexão afetiva imediata
.
Home/Dashboard: Central de comando com visualização do Saldo em Tempo Real, Patrimônio Líquido Atual e o alerta de recomendação da planilha: "O orçamento distribuído está maior que sua renda mensal!"
.
Gestor de Gastos Fixos: Checklist interativo que replica a coluna "Pago? (Sim/Não)" da planilha, com filtros por "Dia de Vencimento"
.
Visão Anual Dinâmica: Tabela comparativa baseada na aba "Visão anual, metas e investimentos", permitindo o acompanhamento da tendência ascendente do patrimônio
.
2. Componentes e Funcionalidades de UX (Baseado em Pesquisa)
Entrada "One-Tap": Componente de registro ultra-rápido para gastos variáveis frequentes detectados na planilha (ex: "Pão Coroa", "Uber", "Zé Delivery"), minimizando o custo cognitivo do rastreio manual
.
Dashboard Comportamental:
Cores de Status: Verde para gastos dentro do planejado, Vermelho para categorias onde "Restam: negativo" e Amarelo para atenção
.
Gamificação: Barras de progresso para a Reserva de Emergência (meta de 3-6 meses) e metas de longo prazo, visando aumentar o engajamento em 22%
.
Feedback Contextual: Em caso de falha na API ou erro de limite, exibir mensagens claras explicando o "porquê" (análise de causa raiz), eliminando o "vácuo contextual"
.
3. Visualização de Dados e Filtros (KPIs Financeiros)
Gráfico 50/30/20: Visualização da alocação de renda entre Necessidades, Desejos e Poupança
.
Gráfico de Tendência: Linha histórica de Entradas vs. Saídas para identificar sazonalidades
.
Métricas de Saúde: Cards fixos exibindo a Taxa de Poupança (meta de 20%) e a relação DTI (Dívida/Renda), com alerta se ultrapassar 36%
.
4. Requisitos Técnicos
Framework: React com Vite para performance.
Estilização: Tailwind CSS (foco em acessibilidade, modo escuro e alto contraste)
.
Estado e API: React Query para sincronização em tempo real com o Supabase e gerenciamento de cache.
Notificações: Sistema de Toast para lembretes de vencimento (24h antes do due_day)
.
5. Lógica de Parcelamento Visual
O frontend deve exibir gastos variáveis com a lógica de parcelas da planilha (ex: "Passagem Brasília 03/08"), mostrando visualmente quanto do limite do cartão já foi comprometido para os meses seguintes