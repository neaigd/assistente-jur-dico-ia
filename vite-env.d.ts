/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_API_KEY: string
  // Adicione outras variáveis de ambiente VITE_ aqui se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
