import React from 'react';

interface ReportDisplayProps {
  report: string;
  onSendToGmail: () => void;
  isLoading: boolean;
  isLoggedIn: boolean; // Nova prop
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onSendToGmail, isLoading, isLoggedIn }) => {
  if (isLoading) {
    return <p className="text-center text-slate-400 py-8">Gerando relatório...</p>;
  }
  
  if (!report || report.includes("Falha ao gerar relatório") || report.includes("Relatório Indisponível")) {
     return (
      <div className="text-center text-slate-400 py-8">
        <p className="mb-2">{!isLoggedIn ? "Faça login com o Google para carregar e analisar seus e-mails." : (report || "Nenhum relatório para exibir.")}</p>
        {!isLoggedIn && 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-500 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5-2.51a2.25 2.25 0 0 0 1.183-1.981V9M2.25 9a2.25 2.25 0 0 1 2.25-2.25h15A2.25 2.25 0 0 1 21.75 9V9" />
          </svg>
        }
         {report && report.includes("Nenhum e-mail encontrado") && (
          <p className="mt-2">Verifique se há e-mails relevantes na sua caixa de entrada ou ajuste os termos de busca no código, se necessário.</p>
        )}
      </div>
    );
  }


  const formattedReport = report.split('\n').map((line, index) => {
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-semibold text-sky-400 mt-6 mb-3">{line.substring(3)}</h2>;
    }
    if (line.startsWith('- **Processo')) {
      const parts = line.substring(2).split('**:');
      return (
        <p key={index} className="mb-2 text-slate-300">
          <strong className="text-sky-300">{parts[0]}</strong>: {parts[1]}
        </p>
      );
    }
     if (line.startsWith('- ')) {
      // Evitar transformar linhas de exemplo de e-mail em listas
      if (line.includes("Assunto:") || line.includes("Corpo:") || line.includes("Remetente:")) {
         return <p key={index} className="mb-1 text-slate-300">{line}</p>;
      }
      return <li key={index} className="ml-4 list-disc list-inside text-slate-300">{line.substring(2)}</li>;
    }
    return <p key={index} className="mb-1 text-slate-300">{line}</p>;
  });

  return (
    <div className="space-y-4">
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none p-4 bg-slate-700/50 rounded-lg shadow min-h-[200px]">
        {formattedReport}
      </div>
      <button
        onClick={onSendToGmail}
        className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50"
        disabled={!isLoggedIn || !report || report.includes("Falha ao gerar relatório.") || report.includes("Nenhum e-mail encontrado") || report.includes("Relatório Indisponível") || report.includes("Relatório de Demonstração")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        Enviar Relatório por E-mail (Gmail)
      </button>
    </div>
  );
};