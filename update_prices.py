#!/usr/bin/env python3
"""قیمت‌ها را از صفحه‌ی اصلی tgju.org می‌خواند و در prices.json می‌نویسد (ریال)."""
import html, json, re, sys, time, urllib.request
from datetime import datetime, timezone

URL = "https://www.tgju.org/"
# هر الگو: برچسب + اولین عدد بعد از آن. lookbehind برای ردیف‌های «حباب ...» است.
PATTERNS = {
    "geram18": r"طلای 18 عیار\s+([\d,]{6,})",
    "geram24": r"طلای 24 عیار\s+([\d,]{6,})",
    "silver_999": r"گرم نقره 999\s+([\d,]{5,})",
    "price_dollar_rl": r"(?<![آ-ی])دلار\s+([\d,]{6,})",
    "sekee": r"(?<!حباب )سکه امامی\s+([\d,]{9,})",
    "sekeb": r"(?<!حباب )سکه بهار آزادی\s+([\d,]{9,})",
}
DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def to_text(raw):
    raw = re.sub(r"(?is)<(script|style).*?</\1>", " ", raw)
    raw = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return re.sub(r"\s+", " ", raw.replace("\u00a0", " ").translate(DIGITS))


def parse(text):
    out = {}
    for key, pat in PATTERNS.items():
        m = re.search(pat, text)
        if not m:
            raise ValueError("پیدا نشد: " + key)
        out[key] = int(m.group(1).replace(",", ""))
    ratio = out["geram24"] / out["geram18"]
    if not 1.3 < ratio < 1.37:
        raise ValueError("نسبت ۲۴ به ۱۸ غیرعادی است: %.3f" % ratio)
    return out


def fetch():
    req = urllib.request.Request(URL, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Accept-Language": "fa,en;q=0.8"})
    for i in range(3):
        try:
            return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
        except Exception as e:
            print("تلاش", i + 1, "ناموفق:", e, file=sys.stderr)
            time.sleep(5)
    raise RuntimeError("دریافت صفحه ممکن نشد")


if __name__ == "__main__":
    try:
        prices = parse(to_text(fetch()))
    except Exception as e:
        print("خطا:", e, file=sys.stderr)
        sys.exit(1)  # فایل قبلی دست‌نخورده می‌ماند و Action قرمز می‌شود
    data = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "prices": prices}
    with open("prices.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(prices)
