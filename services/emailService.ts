import { SimulatedEmail, GmailMessage, ListMessagesResponse, GmailMessageHeader } from '../types';
import { MAX_EMAILS_TO_PROCESS, EMAIL_QUERY_TERMS } from '../constants';

const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Helper to decode base64url
function base64UrlDecode(str: string): string {
  try {
    // Replace non-url compatible chars with base64 standard chars
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad out with standard base64 required padding characters
    while (str.length % 4) {
      str += '=';
    }
    return atob(str);
  } catch (e) {
    console.error("Failed to decode base64url string:", str, e);
    return ""; // Return empty or throw error, depending on desired handling
  }
}


// Helper to find the plain text part of an email
const getPlainTextBody = (message: GmailMessage): string => {
  let body = '';
  if (message.payload?.parts) {
    const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body?.data) {
      body = base64UrlDecode(textPart.body.data);
    } else { // Fallback: try to find HTML part and strip tags (very basic)
      const htmlPart = message.payload.parts.find(part => part.mimeType === 'text/html');
      if (htmlPart && htmlPart.body?.data) {
        const decodedHtml = base64UrlDecode(htmlPart.body.data);
        // Basic strip: replace <br> with newline, remove other tags
        body = decodedHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
      }
    }
  } else if (message.payload?.body?.data) { // Single part message
     if (message.payload.mimeType === 'text/plain') {
        body = base64UrlDecode(message.payload.body.data);
     } else if (message.payload.mimeType === 'text/html') {
        const decodedHtml = base64UrlDecode(message.payload.body.data);
        body = decodedHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
     }
  }
  return body.replace(/\s+/g, ' ').trim(); // Normalize whitespace
};

const getHeaderValue = (headers: GmailMessageHeader[], name: string): string => {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : 'N/A';
};

export const fetchGmailEmails = async (accessToken: string): Promise<SimulatedEmail[]> => {
  console.log("Fetching emails from Gmail API...");
  try {
    // 1. List messages (only IDs and threadIDs)
    // Calculate today's date dynamically
    const today = new Date();

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, '0');

    const dateFilter = `after:${year}/${month}/${day}`;

    // Query for emails with specific keywords within the last 15 days
    const query = `${dateFilter} ${EMAIL_QUERY_TERMS}`;
    const listResponse = await fetch(`${GMAIL_API_BASE_URL}/messages?q=${encodeURIComponent(query)}&maxResults=${MAX_EMAILS_TO_PROCESS}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!listResponse.ok) {
      if (listResponse.status === 401) {
         throw new Error("Token de acesso inválido ou expirado. Faça login novamente.");
      }
      const errorData = await listResponse.json().catch(() => ({}));
      throw new Error(`Falha ao listar e-mails: ${listResponse.status} ${listResponse.statusText}. Detalhes: ${errorData.error?.message || 'Sem detalhes'}`);
    }

    const listResult: ListMessagesResponse = await listResponse.json();
    if (!listResult.messages || listResult.messages.length === 0) {
      console.log("No messages found matching query.");
      return [];
    }

    // 2. Fetch full message details for each ID
    const emailPromises = listResult.messages.slice(0, MAX_EMAILS_TO_PROCESS).map(async (msgMeta) => {
      const msgResponse = await fetch(`${GMAIL_API_BASE_URL}/messages/${msgMeta.id}?format=full`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!msgResponse.ok) {
        console.error(`Failed to fetch message ${msgMeta.id}: ${msgResponse.status}`);
        return null; // Skip this email on error
      }
      const message: GmailMessage = await msgResponse.json();
      return {
        id: message.id,
        sender: getHeaderValue(message.payload.headers, 'From'),
        subject: getHeaderValue(message.payload.headers, 'Subject'),
        body: getPlainTextBody(message) || message.snippet, // Fallback to snippet
        date: new Date(parseInt(message.internalDate, 10)).toISOString(),
      } as SimulatedEmail;
    });

    const resolvedEmails = (await Promise.all(emailPromises)).filter(email => email !== null) as SimulatedEmail[];
    console.log(`Fetched ${resolvedEmails.length} emails successfully.`);
    return resolvedEmails;

  } catch (error) {
    console.error("Error fetching Gmail emails:", error);
    if (error instanceof Error && error.message.includes("Token de acesso inválido")) {
        throw error; // Re-throw specific auth error for App.tsx to handle
    }
    throw new Error(`Erro ao buscar e-mails do Gmail: ${error instanceof Error ? error.message : String(error)}`);
  }
};


const mockEmails: SimulatedEmail[] = [
  {
    id: 'email1-mock',
    sender: 'tribunal-mock@tj.jus.br',
    subject: 'Intimação Processo Mock 0012345-67.2023.8.26.0001',
    body: 'Fica V. Sa. intimado para, no prazo de 15 (quinze) dias, apresentar contestação nos autos do processo em epígrafe. Partes: João da Silva vs. Empresa XYZ Ltda. (Dados Mock)',
    date: new Date('2023-10-26T10:00:00Z').toISOString(),
  },
  {
    id: 'email2-mock',
    sender: 'justica-mock@trf.gov.br',
    subject: 'Publicação de Despacho Mock - Processo 2022.51.01.987654-3',
    body: 'Despacho de mero expediente publicado. Autos conclusos ao juiz para deliberação sobre pedido de perícia. Prazo comum de 5 dias para ciência. Envolvidos: Maria Oliveira e Construtora ABC S.A. (Dados Mock)',
    date: new Date('2023-10-25T14:30:00Z').toISOString(),
  }
];

export const fetchSimulatedEmailsFallback = (): SimulatedEmail[] => {
  console.log("Using simulated email fallback...");
  return mockEmails;
};