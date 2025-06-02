
import React from 'react';

interface ConfigurationInstructionsProps {
  missingGeminiKey: boolean;
  missingGoogleClientId: boolean;
}

export const ConfigurationInstructions: React.FC<ConfigurationInstructionsProps> = ({ missingGeminiKey, missingGoogleClientId }) => {
  if (!missingGeminiKey && !missingGoogleClientId) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl p-6 md:p-8 my-6 bg-sky-900/30 border border-sky-700 rounded-lg shadow-xl text-slate-200">
      <div className="flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-sky-400 mr-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <h2 className="text-2xl sm:text-3xl font-bold text-sky-300">Configurando seu Ambiente</h2>
      </div>

      <p className="mb-6 text-slate-300">
        Para que o Assistente Jurídico IA funcione completamente, acessando seus e-mails do Gmail e utilizando os recursos de
        inteligência artificial do Gemini, algumas configurações são necessárias. Siga os passos abaixo:
      </p>

      {missingGoogleClientId && (
        <section className="mb-8 p-6 bg-slate-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">1. Obtendo e Configurando o <code className="bg-slate-700 px-1 rounded text-sky-300">GOOGLE_CLIENT_ID</code></h3>
          <p className="mb-3 text-slate-300">
            O <code className="bg-slate-700 px-1 rounded text-sky-300">GOOGLE_CLIENT_ID</code> permite que este aplicativo solicite acesso seguro aos seus e-mails do Gmail.
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-300 pl-2">
            <li>
              <strong>Acesse o Google Cloud Console:</strong> Vá para <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">console.cloud.google.com</a> e faça login.
            </li>
            <li>
              <strong>Crie ou Selecione um Projeto:</strong> No canto superior esquerdo, use o seletor de projetos para criar um novo (ex: "AssistenteJuridicoIA") ou selecionar um existente.
            </li>
            <li>
              <strong>Ative a API do Gmail:</strong>
              <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                <li>No menu de navegação (☰), vá para "APIs e Serviços" &gt; "Biblioteca".</li>
                <li>Procure por "Gmail API" e clique nela.</li>
                <li>Clique em "ATIVAR".</li>
              </ul>
            </li>
            <li>
              <strong>Configure a Tela de Consentimento OAuth:</strong>
              <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                <li>Menu de navegação &gt; "APIs e Serviços" &gt; "Tela de consentimento OAuth".</li>
                <li>Tipo de Usuário: "Externo", clique em "CRIAR".</li>
                <li>Preencha os campos obrigatórios: Nome do app (ex: Assistente Jurídico IA), E-mail para suporte, Informações de contato do desenvolvedor.</li>
                <li>Clique em "SALVAR E CONTINUAR" nas seções "Escopos" e "Usuários de teste". Adicione seu e-mail como usuário de teste para desenvolvimento.</li>
                <li>Revise e clique em "VOLTAR PARA O PAINEL".</li>
              </ul>
            </li>
            <li>
              <strong>Crie as Credenciais (ID do Cliente OAuth 2.0):</strong>
               <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                <li>Menu de navegação &gt; "APIs e Serviços" &gt; "Credenciais".</li>
                <li>Clique em "+ CRIAR CREDENCIAIS" &gt; "ID do cliente OAuth".</li>
                <li>Tipo de aplicativo: "Aplicativo da Web".</li>
                <li>Nome: (ex: Cliente Web Assistente Jurídico).</li>
                <li>Em "Origens JavaScript autorizadas", clique em "+ ADICIONAR URI". Adicione o endereço onde você executa o aplicativo (ex: <code className="bg-slate-700 px-1 rounded text-xs">http://localhost:3000</code>, <code className="bg-slate-700 px-1 rounded text-xs">http://127.0.0.1:3000</code>, ou o URL do seu ambiente).</li>
                <li>Em "URIs de redirecionamento autorizados", clique em "+ ADICIONAR URI". Adicione os mesmos endereços. (Para GSI, o Google gerencia, mas é bom ter configurado e pode ser necessário se usar outros fluxos no futuro).</li>
                <li>Clique em "CRIAR".</li>
              </ul>
            </li>
            <li>
              <strong>Copie seu ID do Cliente:</strong> Uma janela pop-up mostrará "Seu ID do cliente". Copie este valor.
            </li>
            <li>
              <strong>Configure a Variável de Ambiente <code className="bg-slate-700 px-1 rounded text-sky-300">GOOGLE_CLIENT_ID</code>:</strong>
              <p className="mt-1 mb-1">O aplicativo espera esta chave no ambiente. Como configurar:</p>
              <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-sm">
                <li><strong>Desenvolvimento Local (terminal):</strong> Antes de iniciar, execute: <br/>
                  <code className="bg-slate-700 p-1 rounded text-xs block my-1">export GOOGLE_CLIENT_ID="SEU_ID_DO_CLIENTE_AQUI"</code> (Linux/macOS) <br/>
                  <code className="bg-slate-700 p-1 rounded text-xs block my-1">set GOOGLE_CLIENT_ID=SEU_ID_DO_CLIENTE_AQUI</code> (Windows CMD) <br/>
                  <code className="bg-slate-700 p-1 rounded text-xs block my-1">$env:GOOGLE_CLIENT_ID="SEU_ID_DO_CLIENTE_AQUI"</code> (PowerShell)
                </li>
                <li><strong>Desenvolvimento Local (arquivo <code className="bg-slate-700 px-1 rounded text-xs">.env</code>):</strong> Se seu projeto usa um (com <code className="bg-slate-700 px-1 rounded text-xs">dotenv</code>), adicione: <code className="bg-slate-700 p-1 rounded text-xs block my-1">GOOGLE_CLIENT_ID=SEU_ID_DO_CLIENTE_AQUI</code></li>
                <li><strong>Ambiente de Produção/Hospedagem:</strong> Consulte a documentação da sua plataforma (Vercel, Netlify, etc.) sobre como definir variáveis de ambiente.</li>
              </ul>
              <p className="mt-1 text-xs text-slate-400">Substitua <code className="bg-slate-700 px-1 rounded text-xs">SEU_ID_DO_CLIENTE_AQUI</code> pelo ID copiado.</p>
            </li>
          </ol>
        </section>
      )}

      {missingGeminiKey && (
        <section className="mb-8 p-6 bg-slate-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">2. Obtendo e Configurando a <code className="bg-slate-700 px-1 rounded text-sky-300">API_KEY</code> do Gemini</h3>
           <p className="mb-3 text-slate-300">
            A <code className="bg-slate-700 px-1 rounded text-sky-300">API_KEY</code> do Gemini permite que o aplicativo use os modelos de linguagem da Google para IA.
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-300 pl-2">
            <li>
              <strong>Acesse o Google AI Studio:</strong> Vá para <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">aistudio.google.com</a>.
            </li>
            <li>
              <strong>Obtenha uma Chave de API:</strong>
              <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                <li>Clique em "Get API key" (Obter chave de API) no menu à esquerda ou no topo.</li>
                <li>Clique em "Create API key in new project" (Criar chave de API em novo projeto) ou selecione um projeto existente.</li>
                <li>Copie a chave de API gerada.</li>
              </ul>
            </li>
            <li>
              <strong>Configure a Variável de Ambiente <code className="bg-slate-700 px-1 rounded text-sky-300">API_KEY</code>:</strong>
              <p className="mt-1 mb-1">O aplicativo espera esta chave como <code className="bg-slate-700 px-1 rounded text-sky-300">API_KEY</code>. Como configurar:</p>
              <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-sm">
                 <li><strong>Desenvolvimento Local (terminal):</strong> <br/>
                  <code className="bg-slate-700 p-1 rounded text-xs block my-1">export API_KEY="SUA_CHAVE_API_GEMINI_AQUI"</code> (Linux/macOS) <br/>
                  <code className="bg-slate-700 p-1 rounded text-xs block my-1">set API_KEY=SUA_CHAVE_API_GEMINI_AQUI</code> (Windows CMD) <br/>
                  <code className="bg-slate-700 p-1 rounded text-xs block my-1">$env:API_KEY="SUA_CHAVE_API_GEMINI_AQUI"</code> (PowerShell)
                </li>
                <li><strong>Desenvolvimento Local (arquivo <code className="bg-slate-700 px-1 rounded text-xs">.env</code>):</strong> <code className="bg-slate-700 p-1 rounded text-xs block my-1">API_KEY=SUA_CHAVE_API_GEMINI_AQUI</code></li>
                <li><strong>Ambiente de Produção/Hospedagem:</strong> Defina a variável de ambiente <code className="bg-slate-700 px-1 rounded text-xs">API_KEY</code>.</li>
              </ul>
              <p className="mt-1 text-xs text-slate-400">Substitua <code className="bg-slate-700 px-1 rounded text-xs">SUA_CHAVE_API_GEMINI_AQUI</code> pela chave copiada.</p>
            </li>
          </ol>
        </section>
      )}

      <div className="mt-8 p-4 bg-sky-800/50 border border-sky-600 rounded-md">
        <p className="font-semibold text-sky-300">Importante:</p>
        <p className="text-slate-300 text-sm">
          Após definir ou alterar essas variáveis de ambiente, você precisará <strong>reiniciar seu servidor de desenvolvimento</strong> ou 
          <strong>fazer um novo deploy/build</strong> do seu aplicativo para que as alterações tenham efeito.
        </p>
        <p className="text-slate-300 text-sm mt-2">
          Uma vez configurado, atualize esta página. Os avisos devem desaparecer e o aplicativo estará pronto para uso!
        </p>
      </div>
    </div>
  );
};
