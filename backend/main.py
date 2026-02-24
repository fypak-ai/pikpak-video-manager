from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import pikpak, scraper, cloud, player

app = FastAPI(
    title="PikPak Video Manager API",
    description="API para gerenciamento de vídeos PikPak com reprodutor e raspador integrados",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pikpak.router, prefix="/api/pikpak", tags=["PikPak"])
app.include_router(scraper.router, prefix="/api/scraper", tags=["Scraper"])
app.include_router(cloud.router, prefix="/api/cloud", tags=["Cloud"])
app.include_router(player.router, prefix="/api/player", tags=["Player"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "PikPak Video Manager API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
