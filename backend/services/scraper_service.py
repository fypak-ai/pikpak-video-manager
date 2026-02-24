import asyncio
import base64
import re
from typing import Optional
from playwright.async_api import async_playwright, Browser, Page

VIDEO_EXTENSIONS = [".mp4", ".m3u8", ".mkv", ".avi", ".webm", ".mov", ".flv"]
VIDEO_MIME_TYPES = ["video/", "application/x-mpegURL", "application/vnd.apple.mpegurl"]

class ScraperService:
    def __init__(self):
        self._browser: Optional[Browser] = None
        self._page: Optional[Page] = None
        self._captured_urls: list[str] = []

    async def _get_browser(self) -> Browser:
        if not self._browser:
            playwright = await async_playwright().start()
            self._browser = await playwright.chromium.launch(headless=True)
        return self._browser

    async def extract_video_links(self, url: str, selectors: list[str] = []) -> list[dict]:
        """Extrai links de vídeo de uma página web"""
        captured = []
        
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Intercepta requisições de rede para capturar streams
            async def handle_request(request):
                req_url = request.url
                if any(ext in req_url for ext in VIDEO_EXTENSIONS):
                    captured.append({"url": req_url, "type": "network_intercept", "source": url})
                elif any(mime in request.headers.get("accept", "") for mime in VIDEO_MIME_TYPES):
                    captured.append({"url": req_url, "type": "mime_intercept", "source": url})
            
            page.on("request", handle_request)
            
            await page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Busca tags <video> e <source>
            video_tags = await page.eval_on_selector_all(
                "video source, video[src]",
                "els => els.map(e => e.src || e.getAttribute('src')).filter(Boolean)"
            )
            for v in video_tags:
                captured.append({"url": v, "type": "video_tag", "source": url})
            
            # Busca iframes de players conhecidos (YouTube, Vimeo, etc)
            iframes = await page.eval_on_selector_all(
                "iframe[src]",
                "els => els.map(e => e.src).filter(s => s.includes('youtube') || s.includes('vimeo') || s.includes('dailymotion'))"
            )
            for iframe in iframes:
                captured.append({"url": iframe, "type": "iframe_embed", "source": url})
            
            # Selectores customizados
            for selector in selectors:
                try:
                    found = await page.eval_on_selector_all(
                        selector,
                        "els => els.map(e => e.href || e.src).filter(Boolean)"
                    )
                    for f in found:
                        captured.append({"url": f, "type": "custom_selector", "source": url})
                except:
                    pass
            
            await browser.close()
        
        # Remove duplicatas
        seen = set()
        unique = []
        for item in captured:
            if item["url"] not in seen:
                seen.add(item["url"])
                unique.append(item)
        
        return unique

    async def screenshot(self, url: str) -> str:
        """Captura screenshot de uma URL e retorna em base64"""
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            img = await page.screenshot(type="jpeg", quality=80)
            await browser.close()
            return base64.b64encode(img).decode()

    async def navigate(self, url: str) -> str:
        """Navega para uma URL no browser gerenciado"""
        browser = await self._get_browser()
        if not self._page or self._page.is_closed():
            self._page = await browser.new_page()
        await self._page.goto(url, wait_until="domcontentloaded", timeout=15000)
        return self._page.url
