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

# Initialize LLM using HuggingFace Inference API or alternative provider
openai_key = OPENAI_API_KEY
if openai_key.startswith("hhf_"):
    # Fix potential typo where key is prefixed with double 'h'
    openai_key = openai_key[1:]

if openai_key.startswith("hf_"):
    Settings.llm = HuggingFaceInferenceAPI(
        model_name=CHAT_MODEL,
        token=openai_key,
        temperature=0.7,
        max_tokens=512
    )
elif openai_key.startswith("sk-") or "openai.com" in os.environ.get("OPENAI_BASE_URL", ""):
    from llama_index.llms.openai import OpenAI
    Settings.llm = OpenAI(
        model=CHAT_MODEL,
        api_key=openai_key,
        api_base=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        temperature=0.7,
        max_tokens=512
    )
elif openai_key.startswith("gsk_") or "groq.com" in os.environ.get("OPENAI_BASE_URL", ""):
    from llama_index.llms.openai import OpenAI
    Settings.llm = OpenAI(
        model=CHAT_MODEL,
        api_key=openai_key,
        api_base=os.environ.get("OPENAI_BASE_URL", "https://api.groq.com/openai/v1"),
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


def ingest_knowledge_directory():
    """Scan backend/knowledge directory and index markdown documents into the vector store."""
    knowledge_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge")
    if not os.path.exists(knowledge_dir):
        print(f"[VectorStore] Knowledge directory not found: {knowledge_dir}")
        return
        
    print(f"[VectorStore] Scanning knowledge directory: {knowledge_dir}")
    
    # Clear old system documents first to avoid duplicates
    try:
        chroma_collection.delete(where={"username": "system"})
        print("[VectorStore] Cleared existing system documents.")
    except Exception as e:
        print(f"[VectorStore] Error clearing old system documents: {e}")
        
    for filename in os.listdir(knowledge_dir):
        if filename.endswith(".md") or filename.endswith(".txt"):
            filepath = os.path.join(knowledge_dir, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                doc = Document(
                    text=content,
                    metadata={
                        "username": "system",
                        "type": "knowledge",
                        "filename": filename,
                        "title": filename.replace(".md", "").replace("_", " ").title()
                    }
                )
                index.insert(doc)
                print(f"[VectorStore] Indexed knowledge document: {filename}")
            except Exception as e:
                print(f"[VectorStore] Error indexing {filename}: {e}")


# Auto-ingest knowledge documents on import
try:
    ingest_knowledge_directory()
except Exception as e:
    print(f"[VectorStore] Failed to auto-ingest knowledge: {e}")


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
    
    doc = Document(
        text=summary_text,
        metadata={"username": username, "type": "profile"}
    )
    
    try:
        chroma_collection.delete(where={"username": username})
    except Exception:
        pass
        
    index.insert(doc)
    print(f"[VectorStore] Indexed updated profile for user: {username}")


def get_user_chat_engine(username: str):
    """Returns a ChatEngine configured to filter specifically for this user's data and system knowledge."""
    from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, FilterOperator
    
    # Filter so this user retrieves their own data OR system knowledge
    filters = MetadataFilters(
        filters=[
            MetadataFilter(key="username", value=[username, "system"], operator=FilterOperator.IN)
        ]
    )
    
    chat_engine = index.as_chat_engine(
        chat_mode="condense_plus_context",
        similarity_top_k=5,
        filters=filters,
        context_prompt=(
            "You are a professional financial AI assistant for Stock Time Nexus.\n"
            "You have deep expertise in stock markets, technical analysis, and portfolio management.\n"
            "Here is the context (which includes website features, team biographies, AI models, pricing, and the user's specific portfolio profile):\n"
            "{context_str}\n"
            "\n"
            "Use the provided context to answer questions about the website, the developers (e.g. Tirth Patel), "
            "pricing plans, AI models, or the user's portfolio.\n"
            "If the user asks questions about themselves or their portfolio, answer using their specific portfolio details.\n"
            "If the user asks about the platform, explain using the website context.\n"
            "Keep responses concise and formatted with bullet points when appropriate.\n"
            "Always remind users that nothing you say constitutes financial advice."
        ),
        verbose=True
    )
    return chat_engine


def query_knowledge_base_fallback(query: str, username: str) -> dict:
    """Fallback method that queries ChromaDB directly, retrieves matching passages, and formats a response.
    Use this if the LLM API fails or is not configured."""
    from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, FilterOperator
    
    filters = MetadataFilters(
        filters=[
            MetadataFilter(key="username", value=[username, "system"], operator=FilterOperator.IN)
        ]
    )
    
    try:
        retriever = index.as_retriever(similarity_top_k=3, filters=filters)
        nodes = retriever.retrieve(query)
    except Exception as e:
        print(f"[VectorStore] Fallback retrieval error: {e}")
        nodes = []
    
    if not nodes:
        return {
            "reply": "I searched the website knowledge database for your query, but could not find any matching details.",
            "tokens": 0,
            "model": "ChromaDB-retriever (fallback)",
            "live": False
        }
        
    reply = "🔍 **Retrieved from Website Knowledge Base**:\n\n"
    for i, node in enumerate(nodes, 1):
        source = node.node.metadata.get("title", node.node.metadata.get("filename", "Context"))
        text = node.node.text.strip()
        if len(text) > 450:
            text = text[:450] + "..."
        reply += f"**[{i}] Source: {source}**\n{text}\n\n"
        
    reply += "*Note: This reply was generated directly from matching documents because the HuggingFace API key is not active, invalid, or returned an error.*"
    
    return {
        "reply": reply,
        "tokens": 0,
        "model": "ChromaDB-retriever (fallback)",
        "live": False
    }


def get_indexed_documents():
    """List all indexed documents from ChromaDB."""
    try:
        results = chroma_collection.get()
        documents = []
        if results and "metadatas" in results:
            seen_titles = set()
            for metadata in results["metadatas"]:
                if not metadata:
                    continue
                username = metadata.get("username", "")
                doc_type = metadata.get("type", "")
                title = metadata.get("title", metadata.get("filename", "Custom Snippet"))
                
                doc_key = f"{username}:{title}"
                if doc_key in seen_titles:
                    continue
                seen_titles.add(doc_key)
                
                documents.append({
                    "title": title,
                    "type": doc_type,
                    "username": username
                })
        return documents
    except Exception as e:
        print(f"[VectorStore] Error fetching indexed documents: {e}")
        return []
