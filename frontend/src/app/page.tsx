"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatstore";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function Home() {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  async function sendMessage(text?: string) {
    const userMessage = text || input;

    addMessage({ role: "user", text: userMessage });

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    const data = await res.json();

    addMessage({ role: "bot", text: data.answer, sources: data.sources });
    setInput("");
  }

  function startListening() {
    SpeechRecognition.startListening({ continuous: false });
  }

  function stopAndSend() {
    SpeechRecognition.stopListening();
    if (transcript) {
      sendMessage(transcript);
      resetTranscript();
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block p-2 rounded-lg ${
                m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {m.text}
            </div>
            {m.sources && (
              <div className="text-xs text-blue-500">
                Sources:{" "}
                {m.sources.map((s) => (
                  <a key={s} href={s} target="_blank" rel="noreferrer">
                    {s}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 p-2 border rounded"
          value={input || transcript}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aven..."
        />
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={() => sendMessage()}
        >
          Send
        </button>
        <button
          className={`p-2 rounded ${
            listening ? "bg-red-500 text-white" : "bg-gray-300"
          }`}
          onClick={listening ? stopAndSend : startListening}
        >
          🎤
        </button>
      </div>
    </div>
  );
}
