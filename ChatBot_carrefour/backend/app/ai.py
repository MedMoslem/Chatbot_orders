from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("OPENAI_API_KEY"))

def ask_ai(question, context=""):
    prompt = f"""
You are a helpful store assistant.
Use the context below if it exists.

Context:
{context}

User question:
{question}

Answer clearly.
"""

    response = client.chat.completions.create(
        model=os.getenv("LLM_MODEL"),
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

print(ask_ai("Hello", ""))