from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key="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")

def ask_ai(question, context=""):
    prompt = f"""
You are a helpful store assistant.
Use the context below if it exists.

Context:
{context}

User question:
{question}

INSTRUCTIONS:
1. Answer the user's question clearly.
2. If the user explicitly confirms they want to buy a product (e.g., "yes, buy it", "add to cart", "I'll take it"), you MUST return a JSON object in your response.
3. The JSON object must be strictly formatted as follows:
{{
  "answer": "Your text response to the user confirming the action",
  "order": {{
    "items": [
      {{ "name": "Product Name", "quantity": 1, "price": 10.0 }}
    ],
    "total": 10.0
  }}
}}
4. If there is NO order confirmation, just return the plain text answer. Do NOT return JSON unless an order is confirmed.

Answer:
"""

    response = client.chat.completions.create(
        model=os.getenv("LLM_MODEL"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1 # Lower temperature for more consistent JSON
    )

    return response.choices[0].message.content

#print(ask_ai("Hello", ""))