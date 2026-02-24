from fastapi import APIRouter
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
    """Envia vídeo raspado direto para a nuvem PikPak"""
    result = await client.add_url(req.video_url, req.folder_id)
    return {"success": True, "task": result}

@router.get("/folders")
async def list_folders():
    """Lista pastas disponíveis na nuvem PikPak"""
    folders = await client.list_folders()
    return {"folders": folders}

@router.post("/create-folder")
async def create_folder(body: dict):
    """Cria nova pasta na nuvem PikPak"""
    name = body.get("name", "Nova Pasta")
    parent_id = body.get("parent_id", "")
    result = await client.create_folder(name, parent_id)
    return {"folder": result}
