from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from scraper import scrape_product
from ai import ask_ai
from database import create_order


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
faq_data = pd.read_csv("faq.csv")
conversation_memory = []

# jib faq database
faq_data = pd.read_csv("faq.csv")
def update_memory(role, message):
    conversation_memory.append({"role": role, "message": message})

    # khalili ekher 10 messaget
    if len(conversation_memory) > 10:
        conversation_memory.pop(0)

def search_faq(user_question: str):
    for _, row in faq_data.iterrows():
        if row["question"].lower() in user_question.lower():
            return row["answer"]
    return None
@app.get("/chat")
def chat(q: str):
    #jeweb mel faq
    faq_answer = search_faq(q)
    if faq_answer:
        return {"answer": faq_answer}
    return {"answer": "I don't know this yet, but I'm learning."}
@app.get("/scraper")
def scrape(url: str):
    data = scrape_product(url)
    return data
def search_faq(question):
    for _, row in faq_data.iterrows():
        if row["question"].lower() in question.lower():
            return row["answer"]
    return None
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    url: str = None

@app.post("/smartchat")
def smartchat(request: ChatRequest):
    q = request.message
    url = request.url

    #faq
    faq_answer = search_faq(q)
    if faq_answer:
        return {"answer": faq_answer, "source": "faq"}

    #scrape
    scraped_context = ""
    if url:
        product = scrape_product(url)
        if product and product["title"] != "Not found":
            scraped_context = (
                f"Product Title: {product['title']}\n"
                f"Price: {product['price']}"
            )
            ai_reply = ask_ai(q, scraped_context)
            return {
                "answer": ai_reply,
                "source": "scraper+ai",
                "product": product
            }

    history = ""
    for msg in conversation_memory:
        history += f"{msg['role']}: {msg['message']}\n"

    full_context = scraped_context + "\n\nChat History:\n" + history

    ai_reply = ask_ai(q, full_context)
    update_memory("user", q)
    update_memory("assistant", ai_reply)

    return {"answer": ai_reply, "source": "ai"}
class OrderRequest(BaseModel):
    product: str
    quantity: int
    name: str = None
    phone: str = None
    address: str = None
    items: list = []
    total: float = 0.0

@app.post("/create-order")
def create_order_endpoint(request: OrderRequest):
    # For now, we'll just use the first item if items list is provided, or the product/quantity fields
    product_name = request.product
    quantity = request.quantity
    
    if request.items:
        # If multiple items, we might want to store them differently, 
        # but for now let's just take the first one or join them
        product_name = ", ".join([item['name'] for item in request.items])
        quantity = sum([item['quantity'] for item in request.items])

    order_id = create_order(product_name, quantity)
    return {
        "status": "success",
        "message": "Order placed successfully!",
        "order_id": order_id,
        "product": product_name,
        "quantity": quantity
    }
