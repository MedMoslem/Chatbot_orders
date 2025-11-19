import requests
from bs4 import BeautifulSoup
'''api-key = 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'''
def scrape_product(url):
    page = requests.get(url, timeout=10)

    soup = BeautifulSoup(page.content, "html.parser")  # use .content, not .text

    title_tag = soup.find("h1")
    price_tag = soup.find("p", class_="price_color")

    title = title_tag.text.strip() if title_tag else "Not found"

    if price_tag:
        raw_price = price_tag.text.strip()

        cleaned = raw_price.encode("ascii", "ignore").decode("ascii")

        price = "£" + cleaned.replace("£", "")
    else:
        price = "Not found"

    return {
        "title": title,
        "price": price
    }
