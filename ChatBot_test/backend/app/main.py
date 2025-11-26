from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from .scraper import scrape_product
from .ai import ask_ai
from .database import create_order, create_session, get_sessions, get_session_messages, add_message, update_session_title


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



import os

# Get the directory where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FAQ_PATH = os.path.join(BASE_DIR, "faq.csv")

# jib faq database
faq_data = pd.read_csv(FAQ_PATH)

def search_faq(user_question: str):
    for _, row in faq_data.iterrows():
        if row["question"].lower() in user_question.lower():
            return row["answer"]
    return None

@app.get("/sessions")
def list_sessions():
    return get_sessions()

@app.post("/sessions")
def new_session():
    session_id = create_session()
    return {"session_id": session_id, "title": "New Chat"}

@app.get("/sessions/{session_id}/messages")
def get_messages(session_id: int):
    return get_session_messages(session_id)

@app.get("/scraper")
def scrape(url: str):
    data = scrape_product(url)
    return data
from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    url: Optional[str] = None
    session_id: Optional[int] = None

@app.post("/smartchat")
def smartchat(request: ChatRequest):
    q = request.message
    url = request.url
    session_id = request.session_id
    
    if not session_id:
        # Create a new session if none provided
        session_id = create_session(title=q[:30] + "..." if len(q) > 30 else q)
    
    # Save user message
    add_message(session_id, "user", q)

    #faq
    faq_answer = search_faq(q)
    if faq_answer:
        add_message(session_id, "assistant", faq_answer)
        return {"answer": faq_answer, "source": "faq", "session_id": session_id}

    #scrape
    scraped_context = ""
    if url:
        product = scrape_product(url)
        if product and product["title"] != "Not found":
            scraped_context = (
                f"Product Title: {product['title']}\n"
                f"Price: {product['price']}\n"
                f"Description: {product['description']}"
            )
            # We might want to save this context or just use it for the AI
            # For now, we just use it for the immediate response
            
            ai_reply = ask_ai(q, scraped_context)
            add_message(session_id, "assistant", ai_reply)
            return {
                "answer": ai_reply,
                "source": "scraper+ai",
                "product": product,
                "session_id": session_id,
                "image": product.get("image")
            }

    # Get history from DB
    previous_messages = get_session_messages(session_id)
    history = ""
    for msg in previous_messages:
        history += f"{msg['role']}: {msg['message']}\n"

    full_context = scraped_context + "\n\nChat History:\n" + history

    ai_reply = ask_ai(q, full_context)
    
    # Try to parse JSON from AI response
    import json
    try:
        # Find JSON content if it's wrapped in text
        import re
        json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            parsed_reply = json.loads(json_str)
            
            # If valid JSON with order, use it
            if "order" in parsed_reply and parsed_reply["order"]:
                add_message(session_id, "assistant", parsed_reply["answer"])
                return {
                    "answer": parsed_reply["answer"],
                    "source": "ai",
                    "order": True,
                    "items": parsed_reply["order"]["items"],
                    "total": parsed_reply["order"]["total"],
                    "session_id": session_id
                }
    except Exception as e:
        print(f"Error parsing AI JSON: {e}")
        # Fallback to treating it as plain text if parsing fails
    
    add_message(session_id, "assistant", ai_reply)
    
    # Update title if it's the first message (or generic title)
    # This is a simple heuristic, can be improved
    if len(previous_messages) <= 2:
         update_session_title(session_id, q[:30] + "..." if len(q) > 30 else q)

    return {"answer": ai_reply, "source": "ai", "session_id": session_id}
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
