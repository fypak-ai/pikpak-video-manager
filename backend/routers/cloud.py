from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pikpak_client import PikPakClient

router = APIRouter()
client = PikPakClient()

class SendToCloudRequest(BaseModel):
    video_url: str
    folder_id: str = ""
    filename: str = ""

@router.post("/send")
async def send_to_cloud(req: SendToCloudRequest):
    """Envia URL de vídeo diretamente para o PikPak"""
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    result = await client.add_url(req.video_url, req.folder_id)
    return {"success": True, "task": result}
