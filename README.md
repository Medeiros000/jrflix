# JRFlix - Streaming Local (Estilo Netflix)

Plataforma de streaming caseira com suporte a **HTTP Range Requests** para streaming contínuo e seek em tempo real, além de integração nativa com o **Google Cast SDK (Chromecast)**.

---

## 🏗️ Arquitetura do Projeto

```text
jrflix/
├── docker-compose.yml       # Orquestração do Postgres, Backend e Frontend
├── midias/                  # Diretório local de arquivos de vídeo (montado em /app/media)
│   └── README.md
├── backend/                 # API Node.js + TypeScript + Express + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de mídia com ENUM (MOVIE, SERIES)
│   │   └── seed.ts          # População inicial de testes
│   ├── src/
│   │   ├── config/          # Variáveis de ambiente
│   │   ├── controllers/     # Controladores HTTP (MediaController)
│   │   ├── services/        # Regras de negócio e streaming em pedaços (MediaService)
│   │   ├── repositories/    # Camada de acesso a dados (MediaRepository)
│   │   ├── middlewares/     # Tratamento de erros centralizado (errorHandler)
│   │   ├── errors/          # Classes de erro customizadas (AppError)
│   │   ├── routes/          # Definição das rotas Express
│   │   ├── app.ts           # Configuração de middlewares e rotas
│   │   └── index.ts         # Inicialização do servidor
│   └── Dockerfile
└── frontend/                # SPA React + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── components/      # Navbar, MediaCard, MediaModal, VideoPlayer
    │   ├── hooks/           # useCast (Chromecast) e useMediaCatalog
    │   ├── services/        # mediaService (fetch HTTP)
    │   ├── types/           # Tipagem estrita de Mídia e Google Cast SDK
    │   └── App.tsx          # Grid estilo Netflix, banners e estados
    └── Dockerfile
```

---

## 🚀 Como Executar

### 1. Iniciar com Docker Compose

Suba todos os serviços com um único comando:

```bash
docker compose up -d --build
```

O compose inicializará:
- **Postgres**: porta `5432`
- **Backend**: porta `4000`
- **Frontend**: porta `3000` (disponível em `http://localhost:3000`)
- **Mapeamento de Mídias**: pasta `./midias` vinculada a `/app/media` no container do backend.

---

### 2. Executar Migrações e Seed do Prisma

No container do backend ou localmente:

```bash
# Executar as migrações do banco
docker compose exec backend npx prisma migrate deploy

# Executar o seed inicial
docker compose exec backend npm run prisma:seed
```

---

### 3. Rodando em Modo de Desenvolvimento Local

Caso queira rodar sem Docker:

#### Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 HTTP Range Requests (Chromecast & Seeking)

A rota `GET /api/media/:id/stream` responde com status **`206 Partial Content`** e os headers essenciais:
- `Accept-Ranges: bytes`
- `Content-Range: bytes <start>-<end>/<total>`
- `Content-Length: <chunk-size>`
- `Content-Type: video/mp4`

Isso permite:
1. Começar a reproduzir o vídeo instantaneamente antes do download completo.
2. Avançar ou retroceder a qualquer momento na barra de progresso (seeking) sem travar.
3. Compatibilidade nativa com o player do Google Chromecast.

