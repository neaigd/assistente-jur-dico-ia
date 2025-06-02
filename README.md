# Assistente Jurídico IA

Um aplicativo web para resumir e-mails de andamentos processuais jurídicos, sugerir providências com Inteligência Artificial (IA) e auxiliar no agendamento de tarefas.

## Descrição

Este projeto tem como objetivo otimizar a rotina de profissionais da área jurídica, automatizando a leitura e interpretação de e-mails contendo publicações e intimações processuais. Utilizando a API do Gmail para acesso aos e-mails e a API Gemini do Google para processamento de linguagem natural, o aplicativo:

1.  Autentica o usuário de forma segura via Google Sign-In.
2.  Busca e-mails relevantes na caixa de entrada do Gmail do usuário (com base em termos jurídicos pré-definidos).
3.  Gera um relatório resumido em Markdown com os pontos-chave de cada e-mail (número do processo, tipo de atualização, partes, prazos, resumo).
4.  Permite o envio deste relatório para o e-mail do usuário.
5.  Sugere providências acionáveis com base no conteúdo do relatório, utilizando IA.
6.  Facilita o agendamento das providências selecionadas diretamente no Google Calendar.

O aplicativo também fornece instruções claras na interface do usuário para configurar as chaves de API necessárias caso não estejam presentes.

## Funcionalidades Principais

*   **Autenticação Segura:** Login com Google (OAuth 2.0) para acesso à API do Gmail.
*   **Busca Inteligente de E-mails:** Filtra e-mails jurídicos relevantes da conta do Gmail.
*   **Resumos com IA:** Utiliza o modelo Gemini do Google para extrair informações e resumir os andamentos processuais.
*   **Relatório em Markdown:** Apresenta os resumos de forma organizada e legível.
*   **Envio por E-mail:** Opção para enviar o relatório gerado para o Gmail do usuário.
*   **Sugestão de Providências com IA:** Gera sugestões de tarefas e prazos com base nos e-mails analisados.
*   **Agendamento no Google Calendar:** Cria links para adicionar as providências sugeridas diretamente na agenda do Google.
*   **Interface Responsiva e Intuitiva:** Desenvolvida com React e Tailwind CSS.
*   **Instruções de Configuração Integradas:** Guia o usuário na configuração das chaves de API necessárias.
*   **Deploy Automatizado:** Configurado para deploy contínuo no GitHub Pages via GitHub Actions.

## Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Estilização:** Tailwind CSS
*   **APIs de IA:** Google Gemini API (`@google/genai`)
*   **Autenticação e E-mail:**
    *   Google Identity Services (GSI) para OAuth 2.0
    *   Gmail API v1
*   **Utilitários:**
    *   `jwt-decode`
*   **Build e Deploy:** Vite, GitHub Actions

## Pré-requisitos

Antes de executar este projeto localmente ou configurar o deploy, você precisará:

1.  Um **Projeto no Google Cloud Console**:
    *   API do Gmail habilitada.
    *   Tela de Consentimento OAuth configurada.
    *   Credenciais de **ID do Cliente OAuth 2.0** (para aplicativo da Web).
2.  Um **Projeto no Google AI Studio** (ou acesso à API Gemini via Google Cloud):
    *   Uma **Chave de API (API Key)** para o Gemini.
3.  Node.js (versão 20.x ou superior) e npm/yarn.
4.  Navegador moderno com suporte a JavaScript Modules.

## Configuração das Variáveis de Ambiente

O aplicativo requer as seguintes variáveis de ambiente para funcionar corretamente:

*   `GEMINI_API_KEY`: Sua chave de API do Google Gemini.
*   `GOOGLE_CLIENT_ID`: Seu ID do Cliente OAuth 2.0 do Google Cloud Console.

Estas variáveis são gerenciadas de duas formas: para desenvolvimento local e para o deploy via GitHub Actions.

### Configuração para GitHub Actions (Deploy no GitHub Pages)

Para que o deploy automático via GitHub Actions funcione (definido em `.github/workflows/deploy.yml`), você precisa configurar as seguintes "Repository Secrets" nas configurações do seu repositório no GitHub (`Settings > Secrets and variables > Actions > New repository secret`):

*   `GEMINI_API_KEY`: Sua chave de API do Google Gemini.
*   `GOOGLE_CLIENT_ID`: Seu ID do Cliente OAuth 2.0 do Google Cloud Console.

O workflow utilizará esses secrets para injetar as chaves durante o processo de build quando a aplicação for deployada no GitHub Pages. A URL base para o GitHub Pages é configurada em `vite.config.ts` como `/assistente-juridico-ia/`.

### Configuração e Execução Local

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/seu-usuario/assistente-juridico-ia.git
    cd assistente-juridico-ia
    ```
    Substitua `seu-usuario` pelo seu nome de usuário no GitHub.

2.  **Instale as Dependências:**
    ```bash
    npm install 
    # ou yarn install
    ```

3.  **Configure as Variáveis de Ambiente (para desenvolvimento local):**
    Crie um arquivo chamado `.env` na raiz do seu projeto e adicione suas chaves:
    ```env
    # Arquivo: .env
    GEMINI_API_KEY="SUA_CHAVE_API_GEMINI_AQUI"
    GOOGLE_CLIENT_ID="SEU_ID_DO_CLIENTE_OAUTH_AQUI"
    ```
    **Importante:** Não adicione o arquivo `.env` ao controle de versão (ele já está incluído no `.gitignore` padrão de projetos Vite/Node). O Vite carregará automaticamente essas variáveis durante o desenvolvimento local (`npm run dev`).

4.  **Obtenha as Chaves (Instruções Detalhadas):**
    O próprio aplicativo exibe instruções detalhadas sobre como obter o `GOOGLE_CLIENT_ID` e a `GEMINI_API_KEY` se elas não estiverem configuradas ao iniciar. Procure pela seção "Configurando seu Ambiente" na interface inicial. Coloque os valores obtidos no seu arquivo `.env` para desenvolvimento local e nos Repository Secrets para o deploy.

    **Resumo para obtenção das chaves:**
    *   **`GOOGLE_CLIENT_ID`**:
        1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
        2.  Crie ou selecione um projeto.
        3.  No menu de navegação, vá para "APIs e Serviços" > "Credenciais".
        4.  Clique em "+ CRIAR CREDENCIAIS" e escolha "ID do cliente OAuth".
        5.  Selecione "Aplicativo da Web" como tipo de aplicativo.
        6.  Dê um nome à credencial (ex: "Assistente Jurídico IA - Web Client").
        7.  Em "Origens JavaScript autorizadas", adicione `http://localhost:5173` (ou a porta que o Vite usar). Para o deploy no GitHub Pages, adicione a URL do seu GitHub Pages (ex: `https://seu-usuario.github.io`).
        8.  Em "URIs de redirecionamento autorizados", adicione `http://localhost:5173` (e a URL do GitHub Pages).
        9.  Clique em "Criar" e copie o **ID do Cliente** gerado.
        10. Certifique-se de que a **API do Gmail** está ativada para o seu projeto em "APIs e Serviços" > "Biblioteca".
        11. Configure a **Tela de consentimento OAuth**:
            *   Tipo de usuário: "Externo".
            *   Preencha as informações do aplicativo.
            *   Adicione os escopos: `../auth/gmail.readonly` e `../auth/userinfo.email` e `../auth/userinfo.profile`.
            *   Adicione seu e-mail como "Usuário de teste" durante o desenvolvimento.
    *   **`GEMINI_API_KEY`**:
        1.  Acesse o [Google AI Studio](https://aistudio.google.com/) ou o Google Cloud Console para gerar uma chave de API para a API Gemini.
        2.  No AI Studio: Clique em "Get API key" > "Create API key in new project" (ou existente).
        3.  Copie a Chave de API gerada.

5.  **Execute o Aplicativo em Modo de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    Abra o endereço fornecido (geralmente `http://localhost:5173` ou similar) no seu navegador.

6.  **Para Fazer o Build de Produção Localmente:**
    ```bash
    npm run build
    ```
    Isso criará uma pasta `dist` com os arquivos otimizados para produção. Você pode pré-visualizar o build com `npm run preview`.

## Fluxo de Uso

1.  **Configuração Inicial (se local):** Certifique-se de que seu arquivo `.env` está configurado.
2.  **Login:** Clique no botão "Login com Google" e autorize o aplicativo a acessar seus e-mails (permissão de leitura apenas).
3.  **Processamento Automático:** Após o login, o aplicativo buscará e-mails relevantes e gerará o relatório de andamentos processuais.
4.  **Visualizar Relatório:** O relatório resumido será exibido na aba "Relatório".
5.  **Enviar por E-mail:** Use o botão "Enviar Relatório por E-mail" para enviar o relatório para sua conta do Gmail.
6.  **Sugerir Providências:** Vá para a aba "Providências". Se ainda não houver sugestões, clique em "Sugerir Providências com IA".
7.  **Selecionar e Agendar:** Selecione as providências desejadas e clique em "Agendar Providências Selecionadas" para abrir links do Google Calendar pré-preenchidos.

## Estrutura de Arquivos Principal

```
.
├── .github/workflows/deploy.yml    # Workflow do GitHub Actions para deploy
├── public/                         # Arquivos estáticos (ex: favicon)
├── src/                            # Código fonte da aplicação
│   ├── components/                 # Componentes React reutilizáveis
│   ├── services/                   # Lógica de interação com APIs externas
│   ├── App.tsx                     # Componente principal da aplicação
│   ├── index.css                   # Estilos globais (Tailwind)
│   ├── index.tsx                   # Ponto de entrada do React (renderiza App)
│   ├── constants.ts                # Constantes globais
│   ├── types.ts                    # Definições de tipos TypeScript
│   └── vite-env.d.ts               # Tipos para variáveis de ambiente Vite
├── .gitignore                      # Arquivos ignorados pelo Git
├── index.html                      # Ponto de entrada HTML para o Vite
├── package.json                    # Dependências e scripts do projeto
├── postcss.config.js               # Configuração do PostCSS (para Tailwind)
├── tailwind.config.js              # Configuração do Tailwind CSS
├── tsconfig.json                   # Configuração do TypeScript
├── tsconfig.node.json              # Configuração do TypeScript para o ambiente Node (Vite)
├── vite.config.ts                  # Configuração do Vite
└── README.md                       # Este arquivo
```

## Troubleshooting

*   **Erro "GOOGLE_CLIENT_ID não configurado" ou "GEMINI_API_KEY não configurada":**
    *   **Localmente:** Verifique se o arquivo `.env` existe na raiz do projeto e se as variáveis estão corretas e sem aspas extras desnecessárias (Vite lida com isso). Reinicie o servidor de desenvolvimento (`npm run dev`).
    *   **GitHub Pages:** Verifique se os "Repository Secrets" `GEMINI_API_KEY` e `GOOGLE_CLIENT_ID` estão configurados corretamente nas configurações do seu repositório no GitHub. Um novo commit na branch `main` será necessário para acionar o workflow com os novos secrets.
    *   Siga as instruções detalhadas na seção "Configurando seu Ambiente" dentro do próprio aplicativo se ele iniciar sem as chaves.
*   **Erro de Autenticação Google / Token Expirado:**
    *   Tente fazer logout e login novamente.
    *   Verifique se as URIs de redirecionamento e origens JavaScript estão corretamente configuradas no seu projeto Google Cloud Console para o ID do Cliente OAuth (para `localhost` e para a URL do GitHub Pages).
    *   Certifique-se de que você (ou os usuários de teste) foram adicionados à lista de usuários de teste na configuração da Tela de Consentimento OAuth durante o desenvolvimento, caso o app não esteja publicado.
*   **Falha ao buscar e-mails ou gerar resumos:**
    *   Confirme se a API do Gmail e a API Gemini estão ativadas nos seus projetos Google Cloud.
    *   Verifique os logs do console do navegador para mensagens de erro detalhadas da API.
    *   Pode haver cotas de API. Verifique o uso no Google Cloud Console.

## Contribuições

Contribuições são bem-vindas! Se você tem sugestões para melhorar o aplicativo, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

MIT (Adicione o arquivo LICENSE.md se desejar formalizar)

---

_Este README foi atualizado para refletir a configuração com Vite, GitHub Actions e melhores práticas para gerenciamento de variáveis de ambiente._
