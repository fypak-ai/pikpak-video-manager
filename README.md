# 🎬 PikPak Video Manager

Gerenciador de vídeos PikPak com reprodutor integrado, armazenamento em nuvem e raspador de vídeos via navegador embutido.

## ✨ Funcionalidades

- 🔗 **Integração PikPak** — gerencie arquivos, pastas e links magnéticos direto na sua nuvem PikPak
- ☁️ **Reprodutor de Vídeo na Nuvem** — reproduza vídeos diretamente do PikPak sem baixar
- 🌐 **Navegador Embutido** — browser Chromium dentro do app para acessar qualquer site
- 🕷️ **Raspador de Vídeos** — extraia links de vídeo de qualquer página visitada no navegador embutido
- 📥 **Envio Direto para Nuvem** — mande os vídeos raspados direto para sua conta PikPak

## 🏗️ Arquitetura

```
pikpak-video-manager/
├── backend/          # API FastAPI (Python)
│   ├── pikpak/       # Cliente PikPak (auth, arquivos, streaming)
│   ├── scraper/      # Motor de raspagem (Playwright)
│   └── cloud/        # Integração nuvem e streaming
├── frontend/         # Interface React + Vite
│   ├── components/   # Componentes UI
│   │   ├── Browser/  # Navegador embutido
│   │   ├── Player/   # Reprodutor de vídeo
│   │   └── Cloud/    # Gerenciador de arquivos PikPak
│   └── pages/        # Páginas principais
└── docker/           # Configs Docker
```

## 🚀 Como rodar

### Pré-requisitos
- Docker & Docker Compose
- Conta PikPak

### Setup rápido

```bash
git clone https://github.com/fypak-ai/pikpak-video-manager
cd pikpak-video-manager
cp .env.example .env
# Edite .env com suas credenciais PikPak
docker compose up
```

Acesse `http://localhost:3000`

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11, FastAPI, Playwright |
| Frontend | React 18, Vite, Tailwind CSS |
| Player | Video.js / HLS.js |
| Browser | Electron (embutido) ou iframe sandboxed |
| Nuvem | PikPak API |
| Infra | Docker, Nginx |

## 📖 Documentação

Veja a pasta [`docs/`](./docs/) para documentação detalhada de cada módulo.

## 📜 Licença

MIT
