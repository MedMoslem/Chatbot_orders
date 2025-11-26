import requests
from bs4 import BeautifulSoup
'''api-key = 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'''
def scrape_product(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        page = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(page.content, "html.parser")
        
        # Default values
        title = "Not found"
        price = "Not found"
        description = ""
        image_url = None

        # Title
        if soup.find("h1", class_="page-title"):
            title = soup.find("h1", class_="page-title").text.strip()
        elif soup.find("h1"):
            title = soup.find("h1").text.strip()
            
        # Price
        # MyTek specific: <span class="price">...</span> inside .price-final_price
        price_tag = soup.select_one(".price-final_price .price")
        if price_tag:
            price = price_tag.text.strip()
        else:
            # Fallback
            price_tag = soup.find("span", class_="price")
            if price_tag:
                price = price_tag.text.strip()

        # Description
        description_div = soup.select_one(".product.attribute.description .value")
        if description_div:
            description = description_div.text.strip()
        else:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                description = meta_desc.get("content", "")

        # Image
        # Try Open Graph image first
        og_image = soup.find("meta", property="og:image")
        if og_image:
            image_url = og_image.get("content")
        else:
            # MyTek gallery image
            img_tag = soup.select_one(".gallery-placeholder__image")
            if img_tag:
                image_url = img_tag.get("src")

        return {
            "title": title,
            "price": price,
            "description": description,
            "image": image_url
        }
    except Exception as e:
        print(f"Scraping error: {e}")
        return {
            "title": "Not found",
            "price": "Not found",
            "description": "",
            "image": None
        }
