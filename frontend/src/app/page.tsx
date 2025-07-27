"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatstore";
import VapiChat from "@/components/VapiChat";

export default function Home() {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Send message to backend
  async function sendMessage(text?: string) {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    setIsLoading(true);

    // Show user message immediately
    addMessage({ role: "user", text: userMessage });

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await res.json();

      // Extract sources from context
      const sources = data.context?.map((c: any) => c.source).filter(Boolean) || [];

      addMessage({
        role: "bot",
        text: data.answer || "I'm not sure, please check with a human support agent.",
        sources,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        role: "bot",
        text: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  }

  // Handle messages from Vapi
  const handleVapiMessage = async (message: string, isUser: boolean) => {
    if (isUser) {
      // User spoke something
      await sendMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-8">
        <h1 className="text-4xl font-light text-gray-300">Aven</h1>
        <VapiChat onMessage={handleVapiMessage} />
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-8">
        {/* Chat Area */}
        <div className="flex-1 border border-gray-700 rounded-2xl p-8 mb-6 bg-gray-900/20">
          <h2 className="text-2xl font-light mb-8 text-white">AI Support Agent</h2>
          
          {/* Messages */}
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <p className="text-white text-lg">Hi. I'm Aven's AI support agent.</p>
              </div>
            )}
            
            {messages.map((m, idx) => (
              <div key={idx}>
                {m.role === "user" ? (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                    <p className="text-white text-lg">{m.text}</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-3">
                      <p className="text-white text-lg leading-relaxed">{m.text}</p>
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="text-blue-400 text-sm">
                        Sources: {m.sources.length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <p className="text-white text-lg">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-4 pb-8">
          <input
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-2xl px-6 py-4 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
            placeholder="Type your question about Aven..."
            disabled={isLoading}
          />

          <button
            className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-2xl px-8 py-4 text-white text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}