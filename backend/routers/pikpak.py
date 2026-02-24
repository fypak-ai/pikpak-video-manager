from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pikpak_client import PikPakClient

router = APIRouter()
client = PikPakClient()

class LoginRequest(BaseModel):
    username: str
    password: str

class MagnetRequest(BaseModel):
    magnet: str
    folder_id: str = ""

@router.post("/login")
async def login(req: LoginRequest):
    """Autentica com a API PikPak"""
    result = await client.login(req.username, req.password)
    if not result:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return {"success": True, "message": "Login realizado"}

@router.get("/files")
async def list_files(folder_id: str = ""):
    """Lista arquivos e pastas do PikPak"""
    files = await client.list_files(folder_id)
    return {"files": files}

@router.post("/upload-magnet")
async def upload_magnet(req: MagnetRequest):
    """Envia link magnético para o PikPak"""
    result = await client.add_magnet(req.magnet, req.folder_id)
    return {"task": result}

@router.post("/upload-url")
async def upload_url(body: dict):
    """Envia URL de vídeo direto para o PikPak"""
    url = body.get("url")
    folder_id = body.get("folder_id", "")
    if not url:
        raise HTTPException(status_code=400, detail="URL obrigatória")
    result = await client.add_url(url, folder_id)
    return {"task": result}

@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """Remove arquivo do PikPak"""
    await client.delete_file(file_id)
    return {"success": True}
