import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Database, FileText, Plus, RefreshCw, Layers, ShieldCheck, Cpu } from 'lucide-react';
import Chatbot from '../components/Chatbot';

interface DocumentInfo {
  title: string;
  type: string;
  username: string;
}

const ChatbotDemo: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await axios.get('http://localhost:8000/api/chat/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load indexed documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleIndexDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    setSubmittingDoc(true);
    try {
      await axios.post('http://localhost:8000/api/chat/index_document', {
        title: docTitle.trim(),
        content: docContent.trim(),
        username: 'demo'
      });
      toast.success('Document indexed into ChromaDB successfully! 🚀');
      setDocTitle('');
      setDocContent('');
      fetchDocuments();
    } catch (error) {
      console.error('Error indexing document:', error);
      toast.error('Failed to index document');
    } finally {
      setSubmittingDoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Title Banner */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
              Retrieval-Augmented Generation (RAG) Chatbot
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              Explore your personal website knowledge base in real-time, backed by ChromaDB and LlamaIndex.
            </p>
          </motion.div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns - Document Manager & Ingestion */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vector Store Overview & Listing */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vector Store Manager</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ChromaDB Indexed Knowledge Files</p>
                  </div>
                </div>
                <button
                  onClick={fetchDocuments}
                  disabled={loadingDocs}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingDocs ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingDocs ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : documents.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6">No documents indexed in ChromaDB.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white truncate">{doc.title}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                            {doc.type}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate">
                            User: {doc.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Ingestion Form */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Index Custom Document</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add custom text to your chatbot knowledge base instantly</p>
                </div>
              </div>

              <form onSubmit={handleIndexDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. My Projects, Custom FAQ, About Me"
                    className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content / Text Snippet
                  </label>
                  <textarea
                    rows={4}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Type or paste the facts you want the chatbot to retrieve and answer queries about..."
                    className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submittingDoc ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Index into Vector Store</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Chatbot Interface */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-[580px]"
          >
            <Chatbot inline={true} />
          </motion.div>
        </div>

        {/* Bottom Panel - Metrics & Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-xl"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            RAG System Architecture & Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/25 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Embedding Model</p>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">BAAI/bge-small-en-v1.5</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/25 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vector Database</p>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">ChromaDB Client</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/25 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">RAG Orchestration</p>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">LlamaIndex Core</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/25 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">LLM Provider</p>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">HuggingFace Inference API</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatbotDemo;
