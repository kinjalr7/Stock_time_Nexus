import os
from pathlib import Path
from llama_index.core import VectorStoreIndex, Document, Settings, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.huggingface_api import HuggingFaceInferenceAPI
import chromadb

# --- Configuration ---
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_db")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
CHAT_MODEL = os.environ.get("CHAT_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")

# Initialize Local Embedding Model (Fast, runs locally on CPU)
# BAAI/bge-small-en-v1.5 is an excellent lightweight embedding model.
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Initialize LLM using HuggingFace Inference API
if OPENAI_API_KEY.startswith("hf_"):
    Settings.llm = HuggingFaceInferenceAPI(
        model_name=CHAT_MODEL,
        token=OPENAI_API_KEY,
        temperature=0.7,
        max_tokens=512
    )

# Initialize ChromaDB Client
db = chromadb.PersistentClient(path=CHROMA_DB_PATH)
chroma_collection = db.get_or_create_collection("stock_nexus_users")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

try:
    # Try to load existing index
    index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context)
except Exception:
    # If empty, initialize an empty one
    index = VectorStoreIndex.from_documents([], storage_context=storage_context)


def summarize_user_data(username: str, portfolio: list, watchlist: list) -> str:
    """Generate a string summary of the user's current status for embedding."""
    summary = f"User '{username}' Financial Profile:\n"
    
    if portfolio:
        summary += "- Portfolio Holdings:\n"
        for p in portfolio:
            summary += f"  • {p['quantity']} shares of {p['symbol']} at an average price of ${p['avg_price']}\n"
    else:
        summary += "- Portfolio Holdings: None (Cash only).\n"
        
    if watchlist:
        summary += "- Watchlist:\n"
        summary += "  • " + ", ".join(watchlist) + "\n"
    else:
        summary += "- Watchlist: None.\n"
        
    summary += "User prefers data-driven analysis and risk management."
    return summary


def update_user_index(username: str, portfolio: list, watchlist: list):
    """Update the vector store with the user's latest portfolio and watchlist data."""
    summary_text = summarize_user_data(username, portfolio, watchlist)
    
    # Create a LlamaIndex Document
    doc = Document(
        text=summary_text,
        metadata={"username": username, "type": "profile"}
    )
    
    # We should really delete old documents for this user first to prevent duplication,
    # but for simplicity in this demo, we'll just insert/update. In a production app, 
    # we'd use Chroma collection delete by metadata.
    try:
        chroma_collection.delete(where={"username": username})
    except Exception as e:
        pass # Ignore if not found
        
    index.insert(doc)
    print(f"[VectorStore] Indexed updated profile for user: {username}")


def get_user_chat_engine(username: str):
    """Returns a ChatEngine configured to filter specifically for this user's data."""
    from llama_index.core.vector_stores import ExactMatchFilter, MetadataFilters
    
    # Filter so this user ONLY retrieves their own data
    filters = MetadataFilters(
        filters=[ExactMatchFilter(key="username", value=username)]
    )
    
    # We use a chat engine so it remembers conversation history.
    chat_engine = index.as_chat_engine(
        chat_mode="condense_plus_context",
        similarity_top_k=3,
        filters=filters,
        context_prompt=(
            "You are a professional financial AI assistant for Stock Time Nexus.\n"
            "You have deep expertise in stock markets, technical analysis, and portfolio management.\n"
            "Here is the user's specific portfolio and profile context:\n"
            "{context_str}\n"
            "\n"
            "When asked about specific stocks, give clear data-driven insights.\n"
            "Keep responses concise and formatted with bullet points when appropriate.\n"
            "Always remind users that nothing you say constitutes financial advice."
        ),
        verbose=True
    )
    return chat_engine
