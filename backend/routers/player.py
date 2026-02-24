from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.pikpak_client import PikPakClient
import httpx

router = APIRouter()
client = PikPakClient()

@router.get("/stream/{file_id}")
async def stream_video(file_id: str):
    """Faz proxy de streaming do vídeo PikPak"""
    stream_url = await client.get_stream_url(file_id)
    if not stream_url:
        raise HTTPException(status_code=404, detail="Vídeo não encontrado")
    
    async def video_streamer():
        async with httpx.AsyncClient() as http:
            async with http.stream("GET", stream_url) as resp:
                async for chunk in resp.aiter_bytes(65536):
                    yield chunk
    
    return StreamingResponse(
        video_streamer(),
        media_type="video/mp4",
        headers={"Accept-Ranges": "bytes"}
    )

@router.get("/info/{file_id}")
async def video_info(file_id: str):
    """Retorna metadados e URL de stream do vídeo"""
    info = await client.get_file_info(file_id)
    stream_url = await client.get_stream_url(file_id)
    return {**info, "stream_url": f"/api/player/stream/{file_id}"}
