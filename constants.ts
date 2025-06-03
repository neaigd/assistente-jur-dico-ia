export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002'; // Though not used in this app, good to have as an example

export const APP_TITLE = "Assistente Jurídico IA";

export const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

export const MAX_EMAILS_TO_PROCESS = 10; // Limite para não sobrecarregar a API / processamento
export const EMAIL_QUERY_TERMS = '"andamento processual" OR "intimação" OR "publicação de despacho" OR "sentença" OR "movimentação processual" OR "diário oficial" OR "prazo" OR "ausência de publicação" OR "relatório DJSP"'; // Termos para buscar e-mails jurídicos, incluindo relatórios de ausência e DJSP
