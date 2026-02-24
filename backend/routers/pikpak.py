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

class UrlRequest(BaseModel):
    url: str
    folder_id: str = ""

class FolderRequest(BaseModel):
    name: str
    parent_id: str = ""

@router.post("/login")
async def login(req: LoginRequest):
    result = await client.login(req.username, req.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Credenciais inválidas"))
    return {"success": True, "username": result["username"]}

@router.post("/logout")
async def logout():
    client.access_token = None
    client.refresh_token = None
    client.username = ""
    client.password = ""
    return {"success": True}

@router.get("/status")
async def status():
    return {
        "authenticated": client.is_authenticated,
        "username": client.username if client.is_authenticated else None
    }

@router.get("/files")
async def list_files(folder_id: str = "", page_token: str = ""):
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        result = await client.list_files(folder_id, page_token)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/upload-magnet")
async def upload_magnet(req: MagnetRequest):
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    result = await client.add_magnet(req.magnet, req.folder_id)
    return {"task": result}

@router.post("/upload-url")
async def upload_url(req: UrlRequest):
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    result = await client.add_url(req.url, req.folder_id)
    return {"task": result}

@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    await client.delete_file(file_id)
    return {"success": True}

@router.post("/folders")
async def create_folder(req: FolderRequest):
    if not client.is_authenticated:
        raise HTTPException(status_code=401, detail="Não autenticado")
    result = await client.create_folder(req.name, req.parent_id)
    return {"folder": result}
