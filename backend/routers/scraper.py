from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from services.scraper_service import ScraperService

router = APIRouter()
scraper = ScraperService()

class ScrapeRequest(BaseModel):
    url: str
    selectors: list[str] = []

@router.post("/extract-videos")
async def extract_videos(req: ScrapeRequest):
    """Extrai links de vídeo de uma URL"""
    videos = await scraper.extract_video_links(req.url, req.selectors)
    return {"videos": videos, "count": len(videos)}

@router.post("/screenshot")
async def take_screenshot(body: dict):
    """Tira screenshot de uma página"""
    url = body.get("url")
    screenshot = await scraper.screenshot(url)
    return {"screenshot": screenshot}

@router.websocket("/browser")
async def browser_ws(websocket: WebSocket):
    """WebSocket para controle do navegador embutido"""
    await websocket.accept()
    try:
        async for message in websocket.iter_json():
            action = message.get("action")
            if action == "navigate":
                result = await scraper.navigate(message["url"])
                await websocket.send_json({"type": "navigated", "url": result})
            elif action == "extract":
                videos = await scraper.extract_video_links(message.get("url", ""))
                await websocket.send_json({"type": "videos", "data": videos})
            elif action == "screenshot":
                img = await scraper.screenshot(message.get("url", ""))
                await websocket.send_json({"type": "screenshot", "data": img})
    except WebSocketDisconnect:
        pass
