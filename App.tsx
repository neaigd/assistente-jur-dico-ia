
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import jwtDecode from 'jwt-decode'; // User wants this import style
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ReportDisplay } from './components/ReportDisplay';
import { TaskSuggestions } from './components/TaskSuggestions';
import { ConfigurationInstructions } from './components/ConfigurationInstructions'; // Novo componente
import { SimulatedEmail, AiSuggestedTask, GoogleUser, TokenClient, DecodedJwt } from './types';
import { fetchGmailEmails, fetchSimulatedEmailsFallback } from './services/emailService'; 
import { summarizeTextWithGemini, suggestTasksWithGemini } from './services/geminiService';
import { generateGoogleCalendarLink } from './services/calendarService';
import { GMAIL_SCOPES } from './constants';

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} else {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

// Google Auth
declare global {
  interface Window {
    google: any;
    tokenClient: TokenClient;
  }
}

const App: React.FC = () => {
  const [, setEmails] = useState<SimulatedEmail[]>([]);
  const [markdownReport, setMarkdownReport] = useState<string>('');
  const [aiTasks, setAiTasks] = useState<AiSuggestedTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'report' | 'tasks'>('report');

  const [googleAuthToken, setGoogleAuthToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isGoogleClientInitialized, setIsGoogleClientInitialized] = useState(false);

  // Initialize Google GSI Client
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("GOOGLE_CLIENT_ID is not set. Gmail integration will be disabled.");
      // Não define erro aqui imediatamente, ConfigurationInstructions cuidará da mensagem
    }
    
    const gsiScript = document.getElementById('google-gsi-script');
    if (gsiScript) { // Evita adicionar múltiplos scripts GSI
        if (window.google && window.google.accounts && !window.tokenClient && GOOGLE_CLIENT_ID) {
             window.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: `email profile ${GMAIL_SCOPES}`,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        setGoogleAuthToken(tokenResponse.access_token);
                        // Não é mais necessário decodificar aqui, a chamada userinfo é suficiente
                    } else if (tokenResponse && tokenResponse.error) {
                        setError(`Erro de autenticação Google: ${tokenResponse.error}`);
                        console.error("Google Auth Error:", tokenResponse);
                    }
                },
            });
            setIsGoogleClientInitialized(true);
        } else if (!GOOGLE_CLIENT_ID) {
          setIsGoogleClientInitialized(true); // Permite que o warning de config seja mostrado
        }
        return;
    }


    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
        if (window.google && window.google.accounts && GOOGLE_CLIENT_ID) {
            window.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: `email profile ${GMAIL_SCOPES}`,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        setGoogleAuthToken(tokenResponse.access_token);
                         try {
                            // The imported `jwtDecode` variable is the module object.
                            // The actual decode function is a property on this object.
                            // jwtDecode.jwtDecode<DecodedJwt>(tokenResponse.access_token); // Line removed as decoded variable is unused
                            // console.log("Decoded access token (for informational purposes):", decoded); // Optional: log if needed
                        } catch (e) {
                            console.error("Error decoding access_token (might not be a JWT or might be opaque):", e);
                        }
                    } else if (tokenResponse && tokenResponse.error) {
                        setError(`Erro de autenticação Google: ${tokenResponse.error}`);
                        console.error("Google Auth Error:", tokenResponse);
                    }
                },
            });
            setIsGoogleClientInitialized(true);
        } else if (!GOOGLE_CLIENT_ID) {
            setIsGoogleClientInitialized(true); // Para mostrar o ConfigurationInstructions
             console.warn("GOOGLE_CLIENT_ID não está configurado no momento da inicialização do GSI.");
        }
         else {
            console.error("Google Identity Services library not loaded or GOOGLE_CLIENT_ID missing.");
            setError("Falha ao carregar a biblioteca de login do Google ou GOOGLE_CLIENT_ID não configurado.");
        }
    };
    script.onerror = () => {
        console.error("Failed to load Google GSI script.");
        setError("Falha crítica ao carregar script de autenticação do Google.");
        setIsGoogleClientInitialized(true); // Permite mostrar o erro ou instruções
    };
    document.body.appendChild(script);

    // Set meta tag for client ID (though GIS initTokenClient handles it)
    const metaClientId = document.querySelector('meta[name="google-signin-client_id"]');
    if (metaClientId && GOOGLE_CLIENT_ID) {
      metaClientId.setAttribute('content', GOOGLE_CLIENT_ID);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (window.tokenClient && GOOGLE_CLIENT_ID) {
      window.tokenClient.requestAccessToken();
    } else {
      setError("Cliente Google não inicializado ou GOOGLE_CLIENT_ID não configurado. Verifique as instruções de configuração.");
    }
  };

  const handleGoogleLogout = () => {
    setGoogleAuthToken(null);
    setGoogleUser(null);
    setEmails([]);
    setMarkdownReport('');
    setAiTasks([]);
    if (googleAuthToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(googleAuthToken, () => {
        console.log('Google token revoked');
      });
    }
  };

  // Fetch user profile after token is set
  useEffect(() => {
    if (googleAuthToken) {
      setIsLoading(true); // Adiciona loading para feedback
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${googleAuthToken}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            console.warn("Userinfo fetch failed with 401. Token might be invalid or expired.");
            handleGoogleLogout(); 
            setError("Sua sessão expirou ou o token é inválido. Por favor, faça login novamente.");
          } else {
            setError(`Falha ao buscar informações do usuário: ${response.status}`);
          }
          throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.email) {
          setGoogleUser({ email: data.email, name: data.name || data.given_name || 'Usuário', picture: data.picture });
          setError(null); // Limpa erros anteriores de login/config
        } else {
          console.warn("Userinfo data incomplete or missing email:", data);
          setError("Não foi possível obter o e-mail do usuário do Google.");
          handleGoogleLogout();
        }
      })
      .catch(err => {
        console.error("Error fetching user info:", err);
        // O erro já deve ter sido setado no .then se !response.ok
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [googleAuthToken]);

  const processEmailsAndGenerateReport = useCallback(async () => {
    if (!googleAuthToken && !GEMINI_API_KEY) { 
        setError("Faça login com o Google e configure a API Key do Gemini para usar o aplicativo.");
        setEmails(fetchSimulatedEmailsFallback()); 
        setMarkdownReport("## Relatório de Demonstração\n\n- Configure as chaves de API (Google e Gemini) e faça login para usar dados reais.\n- Este é um relatório com dados de exemplo.");
        return;
    }
    if (!googleAuthToken) {
        setError("Por favor, faça login com o Google para buscar seus e-mails.");
        setMarkdownReport("## Relatório Indisponível\n\n- Faça login com o Google para buscar e analisar seus e-mails.");
        setEmails(fetchSimulatedEmailsFallback()); 
        return;
    }
     if (!ai) {
      setError("API Key do Gemini não configurada. Funcionalidades de IA desabilitadas.");
      try {
        setIsLoading(true);
        const fetchedEmails = await fetchGmailEmails(googleAuthToken);
        setEmails(fetchedEmails);
        setMarkdownReport(`## E-mails Carregados (${fetchedEmails.length})\n\n- API Key do Gemini não configurada. Não é possível gerar o resumo.\n\n${fetchedEmails.map(e => `- **${e.subject}** (de ${e.sender})`).join('\n')}`);
      } catch(err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Falha ao buscar e-mails do Gmail: ${errorMessage}`);
        if (errorMessage.includes("Token de acesso inválido ou expirado") || errorMessage.includes("401")) {
            handleGoogleLogout(); 
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedEmails = await fetchGmailEmails(googleAuthToken);
      setEmails(fetchedEmails);

      let fullReport = "## Relatório de Andamentos Processuais (Gmail)\n\n";
      if (fetchedEmails.length === 0) {
        fullReport += "Nenhum e-mail relevante encontrado em sua caixa de entrada conforme os termos de busca definidos.\n";
      } else {
        for (const email of fetchedEmails) {
          const prompt = `Você é um assistente jurídico especialista. Analise o seguinte texto de um e-mail sobre um andamento processual. Extraia o número do processo (se houver), o tipo de publicação (ex: intimação, despacho, sentença, etc.), as partes envolvidas (se mencionadas), datas importantes ou prazos destacados, e um resumo conciso da atualização em uma frase ou duas. Formate a saída como um item de lista em Markdown, começando com o número do processo em negrito se disponível, seguido pelo tipo de publicação. Exemplo: - **Processo 12345-67.2023.8.26.0001**: Intimação para apresentar réplica em 15 dias. Partes: Reclamante vs. Reclamada. Resumo: O réu foi intimado a apresentar sua defesa no prazo legal.\n\nE-mail:\nAssunto: ${email.subject}\nRemetente: ${email.sender}\nCorpo: ${email.body}`;
          
          const summaryResult = await summarizeTextWithGemini(ai, prompt);
          fullReport += `${summaryResult}\n\n`;
        }
      }
      setMarkdownReport(fullReport);
    } catch (err) {
      console.error("Erro ao processar e-mails:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Falha ao processar e-mails: ${errorMessage}`);
      if (errorMessage.includes("Token de acesso inválido ou expirado") || errorMessage.includes("401")) {
        handleGoogleLogout(); 
      }
      setMarkdownReport("Falha ao gerar relatório a partir dos e-mails do Gmail.");
    } finally {
      setIsLoading(false);
    }
  }, [googleAuthToken, ai]); 

  useEffect(() => {
    if (googleAuthToken && isGoogleClientInitialized && googleUser && ai) { 
      processEmailsAndGenerateReport();
    } else if (!googleAuthToken && isGoogleClientInitialized && (!GEMINI_API_KEY || !GOOGLE_CLIENT_ID)) {
        // Se não logado, e alguma chave faltando, mostra demo.
        setEmails(fetchSimulatedEmailsFallback());
        setMarkdownReport("## Relatório de Demonstração\n\n- Configure as chaves API (Google e Gemini) e faça login com o Google para buscar e analisar seus e-mails reais.\n- Este é um relatório com dados de exemplo.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAuthToken, processEmailsAndGenerateReport, isGoogleClientInitialized, googleUser, ai]); // Adicionado 'ai' como dependência


  const handleSuggestTasks = async () => {
    if (!ai) {
      setError("API Key do Gemini não configurada. Funcionalidades de IA desabilitadas.");
      return;
    }
    if (!markdownReport || markdownReport === "Falha ao gerar relatório." || markdownReport.includes("Nenhum e-mail encontrado") || markdownReport.includes("Relatório Indisponível") || markdownReport.includes("Relatório de Demonstração")) {
      setError("Nenhum relatório de e-mails reais disponível para gerar sugestões de tarefas.");
      setAiTasks([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const tasks = await suggestTasksWithGemini(ai, markdownReport);
      setAiTasks(tasks);
      setCurrentView('tasks');
    } catch (err) {
      console.error("Erro ao sugerir tarefas:", err);
      setError(`Falha ao sugerir tarefas: ${err instanceof Error ? err.message : String(err)}`);
      setAiTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev: string[]) =>
      prev.includes(taskId) ? prev.filter((id: string) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSendToGmail = () => {
    if (!googleUser || !googleUser.email) {
        setError("Não foi possível identificar seu e-mail para envio. Tente fazer login novamente.");
        return;
    }
    const subject = encodeURIComponent("Resumo de Andamentos Processuais - Assistente Jurídico IA");
    const body = encodeURIComponent(markdownReport);
    window.open(`mailto:${googleUser.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleScheduleSelectedTasks = () => {
    selectedTaskIds.forEach(taskId => {
      const task = aiTasks.find((t: AiSuggestedTask) => t.id === taskId);
      if (task) {
        const calendarLink = generateGoogleCalendarLink(task);
        window.open(calendarLink, '_blank');
      }
    });
    alert(`${selectedTaskIds.length} tarefa(s) enviada(s) para agendamento no Google Calendar (novas abas abertas).`);
  };
  
  const showConfigurationInstructions = !GEMINI_API_KEY || !GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Header />
      
      <div className="w-full max-w-4xl my-4">
        {!googleAuthToken && isGoogleClientInitialized && GOOGLE_CLIENT_ID && (
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
            aria-label="Login com Google para Acessar E-mails"
          >
            <svg className="w-5 h-5 mr-2 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
            Login com Google para Acessar E-mails
          </button>
        )}
        {googleAuthToken && googleUser && (
          <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg shadow">
            <div className="flex items-center">
              {googleUser.picture && <img src={googleUser.picture} alt={`Foto de perfil de ${googleUser.name}`} className="w-8 h-8 rounded-full mr-3"/>}
              <span className="text-sm text-slate-300">Logado como: {googleUser.name} ({googleUser.email})</span>
            </div>
            <button
              onClick={handleGoogleLogout}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md shadow transition-colors"
              aria-label="Fazer logout da conta Google"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      
      {isGoogleClientInitialized && showConfigurationInstructions && (
         <ConfigurationInstructions missingGeminiKey={!GEMINI_API_KEY} missingGoogleClientId={!GOOGLE_CLIENT_ID} />
      )}

      {error && (
        <div className="bg-red-500 border-l-4 border-red-700 text-white p-4 mb-6 w-full max-w-4xl rounded-md shadow-lg" role="alertdialog" aria-live="assertive">
          <p className="font-bold">Erro:</p>
          <p>{error}</p>
          {(error.includes("token has been expired or revoked") || error.includes("Token de acesso inválido ou expirado") || error.includes("Sua sessão expirou") || error.includes("401")) && 
           !showConfigurationInstructions && GOOGLE_CLIENT_ID && /* Só mostra se não for erro de config inicial e houver client ID */
           <button onClick={() => {setError(null); handleGoogleLogin();}} className="mt-2 text-sm underline font-semibold hover:text-red-200">Clique aqui para tentar fazer login novamente.</button>
          }
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-lg p-6 md:p-8 mt-2">
        {(!showConfigurationInstructions || (googleAuthToken && googleUser)) && ( // Oculta abas se as instruções estão visíveis e não está logado
        <>
        <div className="flex justify-center space-x-4 mb-6 border-b border-slate-700 pb-4" role="tablist">
          <button
            onClick={() => setCurrentView('report')}
            role="tab"
            aria-selected={currentView === 'report'}
            aria-controls="report-panel"
            id="report-tab"
            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out
                        ${currentView === 'report' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-700 hover:bg-sky-700 text-slate-300 hover:text-white'}`}
          >
            Relatório
          </button>
          <button
            onClick={() => {
              if (!GEMINI_API_KEY || !ai) {
                  setError("A funcionalidade de Providências requer a API Key do Gemini. Verifique as instruções de configuração.");
                  setCurrentView('report'); // Volta para o relatório
                  return;
              }
              if (markdownReport && !markdownReport.includes("Falha ao gerar relatório") && !markdownReport.includes("Nenhum e-mail encontrado") && !markdownReport.includes("Relatório Indisponível") && !markdownReport.includes("Relatório de Demonstração")) {
                 if (aiTasks.length === 0) { 
                    handleSuggestTasks(); 
                 } else {
                    setCurrentView('tasks');
                 }
              } else {
                setError("Gere um relatório com e-mails reais primeiro para ver ou sugerir providências.");
                setCurrentView('report');
              }
            }}
            role="tab"
            aria-selected={currentView === 'tasks'}
            aria-controls="tasks-panel"
            id="tasks-tab"
            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out
                        ${currentView === 'tasks' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-700 hover:bg-sky-700 text-slate-300 hover:text-white'}`}
            disabled={isLoading || !GEMINI_API_KEY || (!markdownReport || markdownReport.includes("Falha ao gerar relatório") || markdownReport.includes("Nenhum e-mail encontrado") || markdownReport.includes("Relatório Indisponível") || markdownReport.includes("Relatório de Demonstração")) && currentView !== 'tasks'}
          >
            Providências
          </button>
        </div>

        {currentView === 'report' && (
          <div id="report-panel" role="tabpanel" aria-labelledby="report-tab">
            <ReportDisplay
              report={markdownReport}
              onSendToGmail={handleSendToGmail}
              isLoading={isLoading && !markdownReport && !showConfigurationInstructions}
              isLoggedIn={!!googleAuthToken && !!googleUser}
            />
          </div>
        )}

        {currentView === 'tasks' && (
          <div id="tasks-panel" role="tabpanel" aria-labelledby="tasks-tab">
            <TaskSuggestions
              tasks={aiTasks}
              selectedTaskIds={selectedTaskIds}
              onToggleTask={handleToggleTask}
              onScheduleSelectedTasks={handleScheduleSelectedTasks}
              isLoading={isLoading && aiTasks.length === 0 && !showConfigurationInstructions}
              onSuggestTasks={handleSuggestTasks} 
              hasTasks={aiTasks.length > 0}
              apiKeyAvailable={!!GEMINI_API_KEY && !!ai}
              isLoggedIn={!!googleAuthToken && !!googleUser}
              reportAvailable={!!markdownReport && !markdownReport.includes("Falha ao gerar relatório") && !markdownReport.includes("Nenhum e-mail encontrado") && !markdownReport.includes("Relatório Indisponível") && !markdownReport.includes("Relatório de Demonstração")}
            />
          </div>
        )}
        </>
        )}
      </main>
      <footer className="text-center mt-8 text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} Assistente Jurídico IA. Todos os direitos reservados.</p>
        <p>Este é um projeto de demonstração. As chaves API (\`process.env.API_KEY\` para Gemini e \`process.env.GOOGLE_CLIENT_ID\` para Gmail) devem ser configuradas no ambiente.</p>
      </footer>
    </div>
  );
};

export default App;
