import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup

URL = "https://www.estjt.ir/price/"
OUTPUT = "prices.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/130.0.0.0 Safari/537.36"
    )
}

DIGITS = str.maketrans(
    "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩",
    "01234567890123456789"
)


def clean_number(text):
    text = text.translate(DIGITS)
    text = text.replace(",", "").replace("٬", "").replace("٫", ".")
    text = re.sub(r"[^\d]", "", text)

    if not text:
        return None

    return int(text)


def get_first_price(row):
    """
    قیمت فعلی در سایت اتحادیه، اولین عدد بعد از نام کالا است.
    """
    cells = row.find_all(["td", "th"])

    for cell in cells[1:]:
        value = clean_number(cell.get_text(" ", strip=True))

        if value and value >= 100000:
            return value

    return None


def find_row(rows, keywords):
    for row in rows:
        text = " ".join(row.stripped_strings)

        if all(keyword in text for keyword in keywords):
            return row

    return None


response = requests.get(
    URL,
    headers=HEADERS,
    timeout=30
)

response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")
rows = soup.find_all("tr")


# طلای ۱۸ عیار
row18 = find_row(rows, ["۱۸ عیار"])

# طلای ۲۴ عیار
row24 = find_row(rows, ["۲۴ عیار"])

# سکه طرح جدید
row_coin = find_row(rows, ["سکه طرح جدید"])


if row18 is None:
    raise RuntimeError("ردیف طلای ۱۸ عیار پیدا نشد")

if row24 is None:
    raise RuntimeError("ردیف طلای ۲۴ عیار پیدا نشد")

if row_coin is None:
    raise RuntimeError("ردیف سکه طرح جدید پیدا نشد")


gold18 = get_first_price(row18)
gold24 = get_first_price(row24)
coin = get_first_price(row_coin)


if not gold18:
    raise RuntimeError("قیمت طلای ۱۸ عیار پیدا نشد")

if not gold24:
    raise RuntimeError("قیمت طلای ۲۴ عیار پیدا نشد")

if not coin:
    raise RuntimeError("قیمت سکه طرح جدید پیدا نشد")


now = datetime.now(ZoneInfo("Asia/Tehran"))


data = {
    "gold18": {
        "value": gold18,
        "unit": "هر گرم"
    },
    "gold24": {
        "value": gold24,
        "unit": "هر گرم"
    },
    "coin": {
        "value": coin,
        "unit": "هر قطعه"
    },
    "updated_at": now.isoformat(),
    "updated_fa": now.strftime("%Y/%m/%d - %H:%M"),
    "source": URL
}


with open(OUTPUT, "w", encoding="utf-8") as file:
    json.dump(
        data,
        file,
        ensure_ascii=False,
        indent=2
    )


print("Prices updated successfully.")
print("Gold 18:", gold18)
print("Gold 24:", gold24)
print("Coin:", coin)
