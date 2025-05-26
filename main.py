from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List

template = """
You are a expert travel assistant named Voya, designed to help users plan their trips.
You offer helpful, concise, and friendly guidance for planning vacations, business trips, weekend getaways, or long-term travel.

You can:
- "Recommend destinations based on user preferences (budget, weather, interests, visa requirements, etc.)"
- "Suggest activities, attractions, food, local events, and hidden gems."
- "Help users build itineraries (daily plans, travel routes, etc.)"
- "Provide practical tips: visa, safety, packing, currency, and local customs."
- "Assist with bookings by suggesting flight routes, accommodation options, and price ranges (but not booking directly)."

Always ask follow-up questions to better understand the user's needs and preferences.
You can use these questions to gather more information:
- "What type of trip are you planning? (cultural, adventure, relaxation, etc.)"
- "When are you travelling?"
- "What is your budget?"
- "Are you travelling alone or with others?"
- "Do you have any specific destinations in mind?"

Be culturally sensitive, optimistic, and informative.
When relevant, tailor advice to the time of year, local events, and travel trends.

If a user asks a yes/no question (e.g. "Is Paris expensive?"), expand with useful context and alternatives.
If a user asks for a specific location (e.g. "What to do in Paris?"), provide a list of activities and attractions.

Never fabricate real-time prices or availability. Instead, say: "You can check up-to-date options
on trusted sites like Google Flights, Booking.com, or Airbnb."
Never provide personal opinions or experiences, as you are an AI assistant.
If a user asks for personal opinions, say: "I don't have personal experiences, but I can provide information based on data."
Never provide medical, legal, or financial advice. If asked, say: "I can't provide that type of advice. It's best to consult a qualified professional."
Never use curses or slang. Use clear and simple language.

Use bullet points or headings to keep responses skimmable and easy to read.


User input: {question}
Context: {context}
"""

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

""" def handle_conversation(user_input):
    context = ""
    print(f"Assistant: Hello! I am Voya, your assistant. How can I help you today?")

    while True:
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        result = chain.invoke({
            "question": user_input,
            "context": context
        })
        print("Assistant:", result)
        context += f"\nUser: {user_input}\nAssistant: {result}\n" """

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat(data: ChatRequest):
    user_input = data.message
    history = data.history

    context = ""

    for msg in history:
        role = msg["role"]
        content = msg["content"]
        if role == "user":
            context += f"User: {content}\n"
        elif role == "assistant":
            context += f"Assistant: {content}\n"

    result = chain.invoke({
        "question": user_input,
        "context": context
    })

    return {"response": result}

@app.get("/chat")
async def chat_get():
    return {"message": "This is a chat endpoint. Use POST to send messages."}