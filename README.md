# Assistente Jurídico IA

Um aplicativo MPC (Multi-Purpose Copilot) para resumir e-mails de andamentos processuais jurídicos, sugerir providências com Inteligência Artificial (IA) e auxiliar no agendamento de tarefas.

## Descrição

Este projeto tem como objetivo otimizar a rotina de profissionais da área jurídica, automatizando a leitura e interpretação de e-mails contendo publicações e intimações processuais. Utilizando a API do Gmail para acesso aos e-mails e a API Gemini do Google para processamento de linguagem natural, o aplicativo:

1.  Autentica o usuário de forma segura via Google Sign-In.
2.  Busca e-mails relevantes na caixa de entrada do Gmail do usuário (com base em termos jurídicos pré-definidos).
3.  Gera um relatório resumido em Markdown com os pontos-chave de cada e-mail (número do processo, tipo de atualização, partes, prazos, resumo).
4.  Permite o envio deste relatório para o e-mail do usuário.
5.  Sugere providências acionáveis com base no conteúdo do relatório, utilizando IA.
6.  Facilita o agendamento das providências selecionadas diretamente no Google Calendar.

O aplicativo também fornece instruções claras na interface do usuário para configurar as chaves de API necessárias caso não estejam presentes no ambiente.

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

## Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Estilização:** Tailwind CSS
*   **APIs de IA:** Google Gemini API (`@google/genai`)
*   **Autenticação e E-mail:**
    *   Google Identity Services (GSI) para OAuth 2.0
    *   Gmail API v1
*   **Utilitários:**
    *   `jwt-decode` (para decodificar tokens JWT, conforme especificado no projeto)
*   **Ambiente de Execução:** Projetado para funcionar como um MPC (Multi-Purpose Copilot), carregado via `index.html`.

## Pré-requisitos

Antes de executar este projeto, você precisará:

1.  Um **Projeto no Google Cloud Console**:
    *   API do Gmail habilitada.
    *   Tela de Consentimento OAuth configurada.
    *   Credenciais de **ID do Cliente OAuth 2.0** (para aplicativo da Web).
2.  Um **Projeto no Google AI Studio** (ou acesso à API Gemini via Google Cloud):
    *   Uma **Chave de API (API Key)** para o Gemini.
3.  Navegador moderno com suporte a JavaScript Modules.

## Variáveis de Ambiente

O aplicativo requer as seguintes variáveis de ambiente para funcionar corretamente:

*   `API_KEY`: Sua chave de API do Google Gemini.
*   `GOOGLE_CLIENT_ID`: Seu ID do Cliente OAuth 2.0 do Google Cloud Console.

## Configuração e Execução

1.  **Clone o Repositório (se aplicável):**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2.  **Configure as Variáveis de Ambiente:**
    Este aplicativo é projetado para um ambiente MPC, onde as variáveis de ambiente `process.env.API_KEY` e `process.env.GOOGLE_CLIENT_ID` devem estar disponíveis no momento da execução do JavaScript no navegador. A forma de configurar isso depende da sua plataforma de desenvolvimento ou hospedagem MPC.
    *   **Para desenvolvimento local/teste,** você pode precisar simular essas variáveis ou usar um servidor de desenvolvimento que permita injetá-las. Consulte a documentação da sua ferramenta MPC.
    *   Se estiver adaptando para um ambiente Node.js, você pode usar um arquivo `.env` com o pacote `dotenv`. Exemplo de arquivo `.env`:
        ```
        API_KEY="SUA_CHAVE_API_GEMINI_AQUI"
        GOOGLE_CLIENT_ID="SEU_ID_DO_CLIENTE_OAUTH_AQUI"
        ```

3.  **Obtenha as Chaves (Instruções Detalhadas):**
    O próprio aplicativo exibe instruções detalhadas sobre como obter o `GOOGLE_CLIENT_ID` e a `API_KEY` do Gemini se elas não estiverem configuradas. Procure pela seção "Configurando seu Ambiente" na interface inicial.

    **Resumo:**
    *   **`GOOGLE_CLIENT_ID`**:
        1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
        2.  Crie/selecione um projeto.
        3.  Ative a "Gmail API".
        4.  Configure a "Tela de consentimento OAuth" (tipo externo, adicione seu e-mail como usuário de teste).
        5.  Vá em "Credenciais", crie um "ID do cliente OAuth", selecione "Aplicativo da Web".
        6.  Em "Origens JavaScript autorizadas" e "URIs de redirecionamento autorizados", adicione o URL onde o aplicativo será executado (ex: `http://localhost:3000` ou o endereço do seu ambiente MPC).
        7.  Copie o ID do Cliente gerado.
    *   **`API_KEY` (Gemini)**:
        1.  Acesse o [Google AI Studio](https://aistudio.google.com/).
        2.  Clique em "Get API key" e crie uma nova chave em um projeto existente ou novo.
        3.  Copie a Chave de API gerada.

4.  **Execute o Aplicativo:**
    Abra o arquivo `index.html` em um navegador web, garantindo que o ambiente esteja configurado para prover as variáveis de ambiente mencionadas. Em um contexto MPC, isso geralmente significa que o framework MPC se encarrega de servir os arquivos e disponibilizar as variáveis de ambiente.

## Fluxo de Uso

1.  **Configuração Inicial:** Se for o primeiro uso e as chaves não estiverem configuradas, siga as instruções na tela para obter e definir `GOOGLE_CLIENT_ID` e `API_KEY`.
2.  **Login:** Clique no botão "Login com Google" e autorize o aplicativo a acessar seus e-mails (permissão de leitura apenas).
3.  **Processamento Automático:** Após o login, o aplicativo buscará e-mails relevantes e gerará o relatório de andamentos processuais.
4.  **Visualizar Relatório:** O relatório resumido será exibido na aba "Relatório".
5.  **Enviar por E-mail:** Use o botão "Enviar Relatório por E-mail" para enviar o relatório para sua conta do Gmail.
6.  **Sugerir Providências:** Vá para a aba "Providências". Se ainda não houver sugestões, clique em "Sugerir Providências com IA".
7.  **Selecionar e Agendar:** Selecione as providências desejadas e clique em "Agendar Providências Selecionadas" para abrir links do Google Calendar pré-preenchidos.

## Estrutura de Arquivos Principal

```
.
├── index.html                      # Ponto de entrada HTML, carrega scripts e CSS
├── index.tsx                       # Ponto de entrada do React
├── App.tsx                         # Componente principal da aplicação
├── metadata.json                   # Metadados da aplicação
├── constants.ts                    # Constantes globais (modelos de IA, escopos, etc.)
├── types.ts                        # Definições de tipos TypeScript
├── components/                     # Componentes React reutilizáveis
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   ├── ReportDisplay.tsx
│   ├── TaskSuggestions.tsx
│   └── ConfigurationInstructions.tsx # Instruções de configuração
├── services/                       # Lógica de interação com APIs externas
│   ├── emailService.ts             # Busca e formatação de e-mails (Gmail API)
│   ├── geminiService.ts            # Interação com Gemini API (resumos, sugestões)
│   └── calendarService.ts          # Geração de links para Google Calendar
└── README.md                       # Este arquivo
```

## Troubleshooting

*   **Erro "GOOGLE_CLIENT_ID não configurado" ou "API_KEY não configurada":**
    *   Verifique se as variáveis de ambiente `GOOGLE_CLIENT_ID` e `API_KEY` estão corretamente definidas no ambiente onde o aplicativo está sendo executado.
    *   Siga as instruções detalhadas na seção "Configurando seu Ambiente" dentro do próprio aplicativo.
    *   Lembre-se de reiniciar seu servidor de desenvolvimento ou refazer o deploy após alterar variáveis de ambiente.
*   **Erro de Autenticação Google / Token Expirado:**
    *   Tente fazer logout e login novamente.
    *   Verifique se as URIs de redirecionamento e origens JavaScript estão corretamente configuradas no seu projeto Google Cloud Console para o ID do Cliente OAuth.
    *   Certifique-se de que você (ou os usuários de teste) foram adicionados à lista de usuários de teste na configuração da Tela de Consentimento OAuth durante o desenvolvimento, caso o app não esteja publicado.
*   **Falha ao buscar e-mails ou gerar resumos:**
    *   Confirme se a API do Gmail e a API Gemini estão ativadas nos seus projetos Google Cloud.
    *   Verifique os logs do console do navegador para mensagens de erro detalhadas da API.
    *   Pode haver cotas de API. Verifique o uso no Google Cloud Console.

## Contribuições

Contribuições são bem-vindas! Se você tem sugestões para melhorar o aplicativo, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

(Especifique sua licença aqui - ex: MIT, Apache 2.0, etc.)

---

_Este README foi gerado com base na estrutura e funcionalidades do projeto Assistente Jurídico IA._
