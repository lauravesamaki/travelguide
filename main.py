from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

template = """
You are a helpful assistant. Your name is Voya.
Here is some context to help you answer the question: {context}
Answer the following question: {question}
"""

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

def handle_conversation(user_input):
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
        context += f"\nUser: {user_input}\nAssistant: {result}\n"

class Message(BaseModel):
    message: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat (data: Message):
    user_input = data.message
    context = ""

    while True:
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        result = chain.invoke({
            "question": user_input,
            "context": context
        })
        context += f"\nUser: {user_input}\nAssistant: {result}\n"
        return {"response": result}

@app.get("/chat")
async def chat_get():
    return {"message": "This is a chat endpoint. Use POST to send messages."}