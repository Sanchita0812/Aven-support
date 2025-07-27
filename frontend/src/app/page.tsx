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
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Aven Support Agent</h1>
        <p className="text-gray-600">Ask questions about Aven's services via text or voice</p>
      </div>

      {/* Voice Chat Component */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <VapiChat onMessage={handleVapiMessage} />
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-lg shadow-sm border">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>👋 Hi! I'm here to help with your Aven questions.</p>
            <p className="text-sm mt-2">You can type your question below or use voice chat above.</p>
          </div>
        )}
        
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-xs lg:max-w-md">
              {/* Message bubble */}
              <div
                className={`inline-block p-3 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-200 text-gray-800 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>

              {/* Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="text-xs text-blue-600 mt-2 px-2">
                  <details className="cursor-pointer">
                    <summary className="font-medium">Sources ({m.sources.length})</summary>
                    <div className="mt-1 space-y-1">
                      {m.sources.map((s: string, i: number) => (
                        <div key={i}>
                          <a
                            href={s}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-blue-800 break-all"
                          >
                            {s}
                          </a>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
          placeholder="Type your question about Aven..."
          disabled={isLoading}
        />

        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}