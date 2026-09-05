"""Build pitch PDF: QR code + headless Chromium print."""
import pathlib

import qrcode

HERE = pathlib.Path(__file__).parent
DEMO_URL = "https://frontend-orcin-eight-y39ieidj2r.vercel.app"

qr = qrcode.make(DEMO_URL, box_size=10, border=2)
qr.save(HERE / "qr_demo.png")

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto(HERE.joinpath("deck.html").as_uri())
    pg.wait_for_timeout(800)
    pg.pdf(path=str(HERE / "GIALAI_EcoChain_Pitch.pdf"), prefer_css_page_size=True)
    b.close()

pdf = HERE / "GIALAI_EcoChain_Pitch.pdf"
print("PDF:", pdf, round(pdf.stat().st_size / 1024), "KB")
