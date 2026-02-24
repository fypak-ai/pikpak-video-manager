import httpx
import os
from typing import Optional

PIKPAK_API_BASE = "https://api-drive.mypikpak.com"
PIKPAK_USER_API = "https://user.mypikpak.com"

class PikPakClient:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.username = os.getenv("PIKPAK_USERNAME", "")
        self.password = os.getenv("PIKPAK_PASSWORD", "")
        self.client_id = "YNxT9w7GMdWvEOKa"
        self.client_secret = "dbw2OtmVEeuUvIptb1Coygx"

    async def login(self, username: str = "", password: str = "") -> bool:
        u = username or self.username
        p = password or self.password
        async with httpx.AsyncClient() as http:
            resp = await http.post(
                f"{PIKPAK_USER_API}/v1/auth/signin",
                json={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "username": u,
                    "password": p,
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token")
                return True
        return False

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    async def list_files(self, folder_id: str = "") -> list:
        params = {"parent_id": folder_id, "limit": 100}
        async with httpx.AsyncClient() as http:
            resp = await http.get(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                params=params
            )
            return resp.json().get("files", [])

    async def list_folders(self) -> list:
        params = {"filters": '{"kind":{"eq":"drive#folder"}}', "limit": 100}
        async with httpx.AsyncClient() as http:
            resp = await http.get(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                params=params
            )
            return resp.json().get("files", [])

    async def get_file_info(self, file_id: str) -> dict:
        async with httpx.AsyncClient() as http:
            resp = await http.get(
                f"{PIKPAK_API_BASE}/drive/v1/files/{file_id}",
                headers=self._headers()
            )
            return resp.json()

    async def get_stream_url(self, file_id: str) -> Optional[str]:
        info = await self.get_file_info(file_id)
        medias = info.get("medias", [])
        for media in medias:
            link = media.get("link", {})
            url = link.get("url")
            if url:
                return url
        return None

    async def add_magnet(self, magnet: str, folder_id: str = "") -> dict:
        async with httpx.AsyncClient() as http:
            resp = await http.post(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                json={
                    "kind": "drive#file",
                    "name": "",
                    "upload_type": "UPLOAD_TYPE_URL",
                    "url": {"url": magnet},
                    "folder_type": "DOWNLOAD" if not folder_id else "",
                    "parent_id": folder_id,
                }
            )
            return resp.json()

    async def add_url(self, url: str, folder_id: str = "") -> dict:
        return await self.add_magnet(url, folder_id)

    async def delete_file(self, file_id: str):
        async with httpx.AsyncClient() as http:
            await http.delete(
                f"{PIKPAK_API_BASE}/drive/v1/files/{file_id}",
                headers=self._headers()
            )

    async def create_folder(self, name: str, parent_id: str = "") -> dict:
        async with httpx.AsyncClient() as http:
            resp = await http.post(
                f"{PIKPAK_API_BASE}/drive/v1/files",
                headers=self._headers(),
                json={
                    "kind": "drive#folder",
                    "name": name,
                    "parent_id": parent_id,
                }
            )
            return resp.json()
