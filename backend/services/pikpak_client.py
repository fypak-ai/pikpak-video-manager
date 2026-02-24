import httpx
import os
import time
from typing import Optional

PIKPAK_API_BASE = "https://api-drive.mypikpak.com"
PIKPAK_USER_API = "https://user.mypikpak.com"
CLIENT_ID = "YNxT9w7GMdWvEOKa"
CLIENT_SECRET = "dbw2OtmVEeuUvIptb1Coygx"

class PikPakClient:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.token_expires_at: float = 0
        self.username: str = os.getenv("PIKPAK_USERNAME", "")
        self.password: str = os.getenv("PIKPAK_PASSWORD", "")

    @property
    def is_authenticated(self) -> bool:
        return bool(self.access_token)

    async def login(self, username: str = "", password: str = "") -> dict:
        u = username or self.username
        p = password or self.password
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.post(
                f"{PIKPAK_USER_API}/v1/auth/signin",
                json={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "username": u,
                    "password": p,
                }
            )
        if resp.status_code == 200:
            data = resp.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            expires_in = data.get("expires_in", 3600)
            self.token_expires_at = time.time() + expires_in - 60
            self.username = u
            self.password = p
            return {"success": True, "sub": data.get("sub"), "username": u}
        error_msg = resp.json().get("error_description", "Credenciais inválidas")
        return {"success": False, "error": error_msg}

    async def refresh(self) -> bool:
        if not self.refresh_token:
            return await self._relogin()
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.post(
                f"{PIKPAK_USER_API}/v1/auth/token",
                json={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                }
            )
        if resp.status_code == 200:
            data = resp.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token", self.refresh_token)
            expires_in = data.get("expires_in", 3600)
            self.token_expires_at = time.time() + expires_in - 60
            return True
        return await self._relogin()

    async def _relogin(self) -> bool:
        if self.username and self.password:
            result = await self.login(self.username, self.password)
            return result["success"]
        return False

    async def _ensure_auth(self):
        if not self.access_token:
            raise Exception("Não autenticado. Faça login primeiro.")
        if time.time() > self.token_expires_at:
            ok = await self.refresh()
            if not ok:
                raise Exception("Sessão expirada. Faça login novamente.")

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    async def list_files(self, folder_id: str = "", page_token: str = "") -> dict:
        await self._ensure_auth()
        params = {
            "parent_id": folder_id or "",
            "limit": 100,
            "filters": '{"trashed":{"eq":false}}',
        }
        if page_token:
            params["page_token"] = page_token
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.get(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                params=params
            )
        data = resp.json()
        return {"files": data.get("files", []), "next_page_token": data.get("next_page_token")}

    async def get_file_info(self, file_id: str) -> dict:
        await self._ensure_auth()
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.get(
                f"{PIKPAK_API_BASE}/drive/v1/files/{file_id}",
                headers=self._headers()
            )
        return resp.json()

    async def get_stream_url(self, file_id: str) -> Optional[str]:
        info = await self.get_file_info(file_id)
        for media in info.get("medias", []):
            url = media.get("link", {}).get("url")
            if url:
                return url
        urls = info.get("web_content_link") or info.get("links", {}).get("application/octet-stream", {}).get("url")
        return urls

    async def add_magnet(self, magnet: str, folder_id: str = "") -> dict:
        await self._ensure_auth()
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.post(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                json={
                    "kind": "drive#file",
                    "name": "",
                    "upload_type": "UPLOAD_TYPE_URL",
                    "url": {"url": magnet},
                    "folder_type": "DOWNLOAD" if not folder_id else "",
                    "parent_id": folder_id or "",
                }
            )
        return resp.json()

    async def add_url(self, url: str, folder_id: str = "") -> dict:
        return await self.add_magnet(url, folder_id)

    async def delete_file(self, file_id: str) -> bool:
        await self._ensure_auth()
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.delete(
                f"{PIKPAK_API_BASE}/drive/v1/files/{file_id}",
                headers=self._headers()
            )
        return resp.status_code in (200, 204)

    async def create_folder(self, name: str, parent_id: str = "") -> dict:
        await self._ensure_auth()
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.post(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                json={"kind": "drive#folder", "name": name, "parent_id": parent_id or ""}
            )
        return resp.json()

    async def move_to_trash(self, file_ids: list) -> bool:
        await self._ensure_auth()
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.post(
                f"{PIKPAK_API_BASE}/drive/v1/files:batchTrash",
                headers=self._headers(),
                json={"ids": file_ids}
            )
        return resp.status_code == 200
