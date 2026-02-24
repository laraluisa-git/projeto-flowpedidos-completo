📦 FlowPedidos - Sistema de Gerenciamento de Pedidos
O FlowPedidos é uma aplicação moderna voltada para o gerenciamento e fluxo de pedidos. O sistema foi desenvolvido para oferecer agilidade no acompanhamento de status, organização de itens e integração com banco de dados em tempo real.

🚀 Tecnologias Utilizadas
Este projeto utiliza o que há de mais moderno no ecossistema JavaScript para garantir performance e escalabilidade:

Frontend: Vite.js + JavaScript (ES6+)

Estilização: Tailwind CSS (Design responsivo e utilitário)

Backend/Ferramentas: Node.js com Express

Banco de Dados & Autenticação: Supabase (PostgreSQL)

Qualidade de Código: ESLint

Build Tool: PostCSS

🛠️ Estrutura do Projeto
O repositório está organizado de forma modular para facilitar a manutenção:

/config: Arquivos de configuração de ambiente e conexões.

/middlewares: Funções intermediárias para tratamento de requisições e segurança.

/public: Ativos estáticos (imagens, ícones, etc.).

/routes: Definição das rotas da API/Servidor.

/scripts: Scripts de automação ou utilitários.

/src: Código fonte principal (Lógica de front-end).

server.js: Ponto de entrada do servidor Node.js.

supabase_schema.sql: Estrutura das tabelas para replicação do banco de dados.

🗄️ Banco de Dados
Para configurar o banco de dados, utilize o arquivo supabase_schema.sql presente na raiz do projeto. Basta copiar o conteúdo e executar no Editor SQL do seu painel do Supabase para criar as tabelas e relacionamentos necessários.

📝 Funcionalidades (Roadmap)
- Criação de pedidos.
- Listagem em tempo real.
- Atualização de status de pedidos.
- Relatórios de vendas (em desenvolvimento).
- Login e controle de acesso (em desenvolvimento).

💻 Detalhamento do Front-end
A interface foi concebida para ser uma Single Page Application (SPA) de alta performance, utilizando Vite.js para um build instantâneo e Tailwind CSS para um design responsivo.

1. Dashboard (Painel de Controle)
Visualização Centralizada: Exibição clara de todos os pedidos ativos em uma grade dinâmica.

Métricas em Tempo Real: Renderização de dados diretamente do banco de dados, exibindo o número do pedido, identificação do cliente e carimbo de data/hora.

Cálculo Dinâmico: O front-end processa os valores unitários e quantidades para exibir o valor total de cada pedido instantaneamente.

2. Gestão de Ciclo de Vida (Status)
Controle de Fluxo: Interface para transição entre estados críticos como "Pendente", "Em Preparo" e "Enviado".

Comunicação Assíncrona: Utilização de requisições fetch ou axios para atualizar o banco de dados sem necessidade de recarregar a página (re-renderização parcial).

3. Sistema de Cadastro Inteligente
Formulários Validados: Implementação de lógica que impede campos vazios ou formatos de moeda inválidos antes do envio ao servidor.

UX Otimizada: Interface de seleção de itens facilitada para acelerar a entrada de novos pedidos no sistema.

4. Integração Técnica e Segurança
Consumo de API: Lógica de GET automático ao carregar o DOM para garantir dados sempre atualizados.

Tratamento de Exceções: Sistema de feedback visual que alerta o usuário em caso de falhas na rede ou erro no servidor.

Variáveis de Ambiente: Sincronização segura com o Supabase através de arquivos .env, protegendo chaves sensíveis.
