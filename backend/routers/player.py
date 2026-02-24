from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.pikpak_client import PikPakClient
import httpx

router = APIRouter()
client = PikPakClient()

@router.get("/stream/{file_id}")
async def stream_video(file_id: str):
    """Faz proxy de streaming do arquivo PikPak"""
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    url = await client.get_stream_url(file_id)
    if not url:
        raise HTTPException(status_code=404, detail="Stream não encontrado")
    async def _stream():
        async with httpx.AsyncClient(timeout=60) as http:
            async with http.stream("GET", url) as resp:
                async for chunk in resp.aiter_bytes(chunk_size=65536):
                    yield chunk
    return StreamingResponse(_stream(), media_type="video/mp4")

@router.get("/info/{file_id}")
async def get_file_info(file_id: str):
    """Retorna informações e URL de stream do arquivo"""
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    info = await client.get_file_info(file_id)
    stream_url = await client.get_stream_url(file_id)
    return {
        "id": info.get("id"),
        "name": info.get("name"),
        "size": info.get("size"),
        "mime_type": info.get("mime_type"),
        "stream_url": stream_url,
        "thumbnail": info.get("thumbnail_link"),
    }
