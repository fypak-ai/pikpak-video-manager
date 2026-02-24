# Arquitetura do PikPak Video Manager

## Visão Geral

O sistema é composto por 3 serviços principais orquestrados via Docker Compose:

```
[Usuário]
    |
    v
[Nginx :80] --> [Frontend React :3000]
    |              |
    v              v
[Backend FastAPI :8000]
    |
    +-- [PikPak API] (nuvem)
    +-- [Playwright] (raspador/navegador)
    +-- [HLS Proxy] (streaming)
```

## Módulos

### Backend (`/backend`)

#### `services/pikpak_client.py`
Cliente HTTP para a API PikPak:
- Autenticação OAuth2
- Listagem/exclusão de arquivos
- Upload por URL/magnet
- Obtenção de URLs de streaming

#### `services/scraper_service.py`
Motor de raspagem baseado em Playwright (Chromium headless):
- Interceptação de requisições de rede (captura streams HLS/MP4)
- Parsing de tags `<video>` e `<source>`
- Detecção de iframes de players (YouTube, Vimeo)
- Controle de browser via WebSocket (para o navegador embutido)

#### `routers/`
- `pikpak.py` — CRUD de arquivos, upload magnet/URL
- `scraper.py` — extração de vídeos, WebSocket browser
- `player.py` — proxy de streaming, metadados
- `cloud.py` — operações de nuvem, pastas

### Frontend (`/frontend`)

#### Páginas
- `CloudPage` — gerenciador de arquivos PikPak (listar, enviar magnet, deletar, abrir no player)
- `PlayerPage` — reprodutor HLS/MP4 com suporte a streams PikPak
- `BrowserPage` — navegador embutido (iframe + WebSocket para backend Playwright)
- `ScraperPage` — raspador de vídeos sob demanda com preview screenshot

## Fluxo de Raspagem

1. Usuário digita URL no Raspador ou Navegador
2. Backend abre Chromium headless via Playwright
3. Intercepta requisições de rede para detectar streams
4. Analisa DOM para `<video>`, `<source>`, iframes
5. Retorna lista de URLs de vídeo encontradas
6. Usuário clica "Enviar ao PikPak" → URL vai para a nuvem

## Fluxo de Streaming

1. Usuário clica "Reproduzir" em um arquivo do PikPak
2. Frontend chama `GET /api/player/info/{file_id}`
3. Backend obtém URL de stream temporária da API PikPak
4. Frontend usa HLS.js para reproduzir streams .m3u8 ou HTML5 nativo para .mp4
