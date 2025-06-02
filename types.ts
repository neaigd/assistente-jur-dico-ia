export interface SimulatedEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  date: string; // ISO String
}

export interface LegalUpdateSummary {
  caseNumber?: string;
  updateType?: string;
  parties?: string;
  deadlines?: string;
  summary: string;
  originalEmailId: string;
}

export interface AiSuggestedTask {
  id: string;
  descricao: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  prazoSugerido?: string; // Format YYYY-MM-DD
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

// Tipos para Autenticação Google
export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export interface TokenClient {
  requestAccessToken: (overrideConfig?: Record<string, unknown>) => void;
}

export interface DecodedJwt {
  email: string;
  name: string;
  picture?: string;
  exp: number;
  // Outras propriedades do JWT...
}


// Tipos para API do Gmail (simplificado)
export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessagePartBody {
  size: number;
  data?: string; // Base64url encoded
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailMessageHeader[];
  body: GmailMessagePartBody;
  parts?: GmailMessagePart[]; // For multipart messages
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: GmailMessagePart;
  internalDate: string; // Timestamp ms as string
}

export interface ListMessagesResponse {
  messages: { id: string; threadId: string }[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}