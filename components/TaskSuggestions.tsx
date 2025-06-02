import React from 'react';
import { AiSuggestedTask } from '../types';

interface TaskSuggestionsProps {
  tasks: AiSuggestedTask[];
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  onScheduleSelectedTasks: () => void;
  isLoading: boolean;
  onSuggestTasks: () => void;
  hasTasks: boolean;
  apiKeyAvailable: boolean;
  isLoggedIn: boolean; // Nova prop
  reportAvailable: boolean; // Nova prop
}

const PriorityBadge: React.FC<{ priority: AiSuggestedTask['prioridade'] }> = ({ priority }) => {
  let bgColor = 'bg-slate-500';
  if (priority === 'Alta') bgColor = 'bg-red-500';
  else if (priority === 'Média') bgColor = 'bg-yellow-500';
  return <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${bgColor}`}>{priority}</span>;
};

export const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({
  tasks,
  selectedTaskIds,
  onToggleTask,
  onScheduleSelectedTasks,
  isLoading,
  onSuggestTasks,
  hasTasks,
  apiKeyAvailable,
  isLoggedIn,
  reportAvailable
}) => {
  if (isLoading) {
    return <p className="text-center text-slate-400 py-8">Sugerindo providências com IA...</p>;
  }

  if (!isLoggedIn) {
    return (
     <div className="text-center py-8">
       <p className="text-slate-400 mb-4">Faça login com o Google e processe seus e-mails para obter sugestões de providências.</p>
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-500 mx-auto mb-4">
         <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
       </svg>
     </div>
   );
 }

  if (!apiKeyAvailable) {
     return (
      <div className="text-center py-8">
        <p className="text-slate-400 mb-4">A funcionalidade de sugestão de providências requer uma chave API do Gemini configurada.</p>
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-500 mx-auto mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.015h-.008v-.015Z" />
        </svg>
      </div>
    );
  }

  if (!hasTasks) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 mb-4">
          { !reportAvailable ? "Gere um relatório de e-mails primeiro para obter sugestões de providências." : "Nenhuma providência sugerida ainda ou o relatório não está disponível."}
        </p>
        <button
          onClick={onSuggestTasks}
          disabled={!reportAvailable || !apiKeyAvailable || !isLoggedIn}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12h.008v.008h-.008V12ZM15.75 21h.008v.008h-.008V21Zm0-12.75h.008v.008h-.008v-.008ZM8.25 21h.008v.008h-.008V21Z" />
          </svg>
          Sugerir Providências com IA
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Providências Sugeridas pela IA</h3>
        <ul className="space-y-3">
          {tasks.map(task => (
            <li key={task.id} className="bg-slate-700 p-4 rounded-lg shadow-md flex items-start space-x-3 hover:bg-slate-600/70 transition-colors duration-200">
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={selectedTaskIds.includes(task.id)}
                onChange={() => onToggleTask(task.id)}
                className="mt-1 h-5 w-5 rounded border-slate-500 text-sky-500 focus:ring-sky-400 bg-slate-600 cursor-pointer"
              />
              <label htmlFor={`task-${task.id}`} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-200">{task.descricao}</span>
                  <PriorityBadge priority={task.prioridade} />
                </div>
                {task.prazoSugerido && (
                  <p className="text-sm text-slate-400 mt-1">Prazo Sugerido: {new Date(task.prazoSugerido + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onScheduleSelectedTasks}
        disabled={selectedTaskIds.length === 0 || !isLoggedIn}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12v-.008Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75v-.008Zm0 2.25h.008v.008H9.75v-.008Zm0-4.5h.008v.008H9.75v-.008Zm4.5 4.5h.008v.008h-.008v-.008Zm0-2.25h.008v.008h-.008V15Zm0-2.25h.008v.008h-.008v-.008Z" />
        </svg>
        Agendar Providências Selecionadas (Google Calendar)
      </button>
    </div>
  );
};