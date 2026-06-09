"""
Phase 3 – AI Chatbot backend.

Supports any OpenAI-compatible endpoint:
  • HuggingFace Inference API  (OPENAI_BASE_URL=https://api-inference.huggingface.co/v1)
  • OpenAI                     (OPENAI_BASE_URL=https://api.openai.com/v1)
  • Groq                       (OPENAI_BASE_URL=https://api.groq.com/openai/v1)

Falls back to a smart local heuristic if no API key is configured.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import httpx

router = APIRouter()

OPENAI_API_KEY  = os.environ.get("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
CHAT_MODEL      = os.environ.get("CHAT_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")

# Sanitize the key - if user put hhf_... (typo), make it hf_...
if OPENAI_API_KEY.startswith("hhf_"):
    OPENAI_API_KEY = OPENAI_API_KEY[1:]

# Detect HuggingFace endpoint so we can adapt the payload
IS_HUGGINGFACE = "huggingface.co" in OPENAI_BASE_URL

SYSTEM_PROMPT = """You are a professional financial AI assistant for Stock Time Nexus.
You have deep expertise in stock markets, technical analysis, and portfolio management.
When asked about specific stocks, give clear data-driven insights.
Keep responses concise and formatted with bullet points when appropriate.
Always remind users that nothing you say constitutes financial advice."""


class ChatMessage(BaseModel):
    role: str     # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: Optional[str] = None   # optional portfolio context from frontend
    username: Optional[str] = "demo" # specific user to fetch vector history for


class IndexRequest(BaseModel):
    title: str
    content: str
    username: Optional[str] = "demo"


@router.post("/")
async def chat(req: ChatRequest):
    # Try using LlamaIndex RAG if possible
    latest_message = req.messages[-1].content if req.messages else ""
    try:
        from .vector_store import get_user_chat_engine
        
        chat_engine = get_user_chat_engine(req.username)
        response = chat_engine.chat(latest_message)
        
        return {
            "reply": str(response),
            "tokens": 0, # Tokens handled internally by LlamaIndex
            "model": "LlamaIndex RAG",
            "live": True,
        }
    except Exception as e:
        print(f"[chatbot] LlamaIndex RAG failed or not configured: {e}. Attempting vector store fallback search.")
        try:
            from .vector_store import query_knowledge_base_fallback
            fallback_res = query_knowledge_base_fallback(latest_message, req.username)
            return fallback_res
        except Exception as fallback_err:
            print(f"[chatbot] Vector store fallback failed: {fallback_err}. Falling back to standard LLM chat.")

    if not OPENAI_API_KEY:
        return _local_fallback(latest_message)

    system_content = SYSTEM_PROMPT
    if req.context:
        system_content += f"\n\n### Current Portfolio Context:\n{req.context}"

    # Build message list
    messages_payload = [
        {"role": "system", "content": system_content},
        *[{"role": m.role, "content": m.content} for m in req.messages],
    ]

    # HuggingFace uses max_new_tokens; OpenAI uses max_tokens
    token_key = "max_new_tokens" if IS_HUGGINGFACE else "max_tokens"

    payload = {
        "model": CHAT_MODEL,
        "messages": messages_payload,
        token_key: 512,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{OPENAI_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
            )
        resp.raise_for_status()
        data = resp.json()

        # Standard OpenAI-compatible response shape
        reply = data["choices"][0]["message"]["content"].strip()
        usage = data.get("usage", {})

        return {
            "reply": reply,
            "tokens": usage.get("total_tokens", 0),
            "model": data.get("model", CHAT_MODEL),
            "live": True,
        }

    except httpx.HTTPStatusError as e:
        detail = e.response.text[:300]
        print(f"[chatbot] API error {e.response.status_code}: {detail}")
        # Let's fallback to semantic search of vector store on error instead of throwing 502
        try:
            from .vector_store import query_knowledge_base_fallback
            return query_knowledge_base_fallback(latest_message, req.username)
        except Exception:
            raise HTTPException(status_code=502, detail=f"LLM API error: {detail}")

    except httpx.TimeoutException:
        print("[chatbot] Request timed out — falling back to vector database/local response")
        try:
            from .vector_store import query_knowledge_base_fallback
            return {**query_knowledge_base_fallback(latest_message, req.username),
                    "note": "HF model timed out (cold start). Direct ChromaDB retrieval used."}
        except Exception:
            return {**_local_fallback(latest_message),
                    "note": "HF model timed out (cold start). Try again in a few seconds."}

    except Exception as e:
        print(f"[chatbot] Unexpected error: {e}")
        try:
            from .vector_store import query_knowledge_base_fallback
            return query_knowledge_base_fallback(latest_message, req.username)
        except Exception:
            return _local_fallback(latest_message)


@router.get("/documents")
def list_documents():
    """Returns a list of all indexed documents in the vector database."""
    try:
        from .vector_store import get_indexed_documents
        return get_indexed_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index_document")
def index_document(req: IndexRequest):
    """Allows manual indexing of new custom document texts via POST request."""
    try:
        from llama_index.core import Document
        from .vector_store import index
        
        doc = Document(
            text=req.content,
            metadata={
                "username": req.username or "demo",
                "type": "custom",
                "title": req.title
            }
        )
        index.insert(doc)
        print(f"[chatbot] Custom document '{req.title}' indexed successfully for user '{req.username}'.")
        return {"status": "success", "message": f"Document '{req.title}' indexed successfully!"}
    except Exception as e:
        print(f"[chatbot] Failed to index custom document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _local_fallback(user_input: str) -> dict:
    """Smart keyword-based fallback when no LLM key is configured or API fails."""
    ui = user_input.lower()

    if any(w in ui for w in ["portfolio", "holding", "position"]):
        reply = (
            "📊 **Portfolio Tip**: Diversification across sectors reduces risk.\n\n"
            "To get real AI-powered portfolio analysis:\n"
            "1. Copy `.env.example` → `.env`\n"
            "2. Add your HuggingFace token: `OPENAI_API_KEY=hf_...`\n"
            "3. Restart the backend"
        )
    elif any(w in ui for w in ["buy", "sell", "trade", "order"]):
        reply = (
            "⚡ **Trading Note**: Always set a stop-loss before entering a trade.\n\n"
            "Recommended free model for trade analysis:\n"
            "`CHAT_MODEL=mistralai/Mistral-7B-Instruct-v0.3`"
        )
    elif any(w in ui for w in ["predict", "forecast", "price target"]):
        reply = (
            "🔮 **Forecast**: This platform uses LSTM, ARIMA, and Prophet for ML predictions.\n\n"
            "Set `OPENAI_API_KEY=hf_...` in your `.env` to get AI-driven price commentary."
        )
    elif any(w in ui for w in ["rsi", "macd", "bollinger", "indicator", "technical"]):
        reply = (
            "📈 **Technical Analysis**:\n"
            "• **RSI** > 70 = overbought, < 30 = oversold\n"
            "• **MACD** crossover above signal = bullish momentum\n"
            "• **Bollinger Bands** squeeze = volatility breakout incoming"
        )
    elif any(w in ui for w in ["huggingface", "model", "api", "key", "setup"]):
        reply = (
            "🤗 **HuggingFace Setup**:\n"
            "1. Sign up at https://huggingface.co\n"
            "2. Go to **Settings → Access Tokens** → create a token\n"
            "3. In `.env` set:\n"
            "   ```\n"
            "   OPENAI_API_KEY=hf_YOUR_TOKEN\n"
            "   OPENAI_BASE_URL=https://api-inference.huggingface.co/v1\n"
            "   CHAT_MODEL=mistralai/Mistral-7B-Instruct-v0.3\n"
            "   ```\n"
            "4. Restart the backend with `uvicorn backend_main:app --reload`"
        )
    else:
        reply = (
            "👋 I'm the Stock Nexus AI assistant!\n\n"
            "I can help with:\n"
            "• Portfolio analysis & holdings\n"
            "• Stock price insights\n"
            "• Technical indicators (RSI, MACD, Bollinger Bands)\n"
            "• Trading strategies\n\n"
            "💡 Add your **HuggingFace token** to `.env` for real AI responses — it's free!"
        )

    return {"reply": reply, "tokens": 0, "model": "local-fallback", "live": False}
