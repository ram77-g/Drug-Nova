"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { sendChatMessage, ChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm the Drug-Nova AI Assistant. Ask me anything about diseases, drugs, proteins, or how to navigate the platform!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error connecting to the backend. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#00d4ff] to-[#a855f7] rounded-full shadow-[0_0_25px_rgba(0,212,255,0.4)] flex items-center justify-center z-[100] text-white border-2 border-[#050810] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all duration-300"
      >
        <MessageCircle size={26} strokeWidth={2.5} />
      </motion.button>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[380px] h-[500px] max-h-[65vh] bg-[#050810]/95 backdrop-blur-3xl border border-[#1e2d4a]/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,212,255,0.1)] flex flex-col overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1e2d4a] bg-gradient-to-r from-[#00d4ff]/10 via-transparent to-transparent flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                  <Bot size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-white font-bold text-[15px] tracking-wide leading-tight">Drug-Nova AI</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.6)]"></span>
                    <span className="text-[#00e676] text-[10px] font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#64748b] hover:text-white transition-all duration-200"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-[#1e2d4a] scrollbar-track-transparent">
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(0,212,255,0.2)] mt-1">
                        <Bot size={16} className="text-white" strokeWidth={2.5} />
                      </div>
                    )}
                    <div
                      style={{ padding: "14px 18px" }}
                      className={`max-w-[75%] rounded-2xl text-[14px] leading-relaxed shadow-md break-words ${
                        isUser
                          ? "bg-gradient-to-br from-[#00d4ff] to-[#0096ff] text-white rounded-br-[4px]"
                          : "bg-[#131b2c] border border-[#1e2d4a] text-gray-200 rounded-bl-[4px]"
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                      ) : (
                        <div className="text-[14px] text-gray-200 [&>p]:mb-3 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ul>li]:mb-1 [&>strong]:text-white [&>strong]:font-semibold [&>a]:text-[#00d4ff] [&>a]:underline hover:[&>a]:text-[#0096ff] [&>pre]:bg-[#0b1120] [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>code]:bg-[#0b1120] [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:text-[#00d4ff] [&>code]:font-mono [&>code]:text-[13px]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(0,212,255,0.2)] mt-1">
                    <Bot size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div style={{ padding: "14px 18px" }} className="bg-[#131b2c] border border-[#1e2d4a] text-[#00d4ff] rounded-2xl rounded-bl-[4px] flex items-center gap-3 shadow-md">
                    <Loader2 size={16} className="animate-spin text-[#00d4ff]" />
                    <span className="text-[13px] font-medium tracking-wide">Analyzing knowledge graph...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#050810] border-t border-[#1e2d4a] shrink-0">
              <div className="flex items-end gap-2 bg-[#0b1120] border border-[#1e2d4a] rounded-2xl p-1.5 focus-within:border-[#00d4ff]/50 focus-within:ring-1 focus-within:ring-[#00d4ff]/20 transition-all duration-300 shadow-inner">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask the AI Assistant..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-[14px] px-3 py-2.5 min-h-[44px] max-h-[120px] resize-none placeholder:text-[#4b5a78] scrollbar-thin scrollbar-thumb-[#1e2d4a]"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 shrink-0 flex items-center justify-center bg-gradient-to-br from-[#00d4ff] to-[#0096ff] hover:opacity-90 text-white rounded-xl transition-all duration-200 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,212,255,0.3)] mb-[2px] mr-[2px]"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
              <div className="text-center mt-3 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#4b5a78] uppercase">Powered by Gemini 2.5 Flash</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
