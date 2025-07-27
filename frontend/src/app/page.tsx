"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatstore";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function Home() {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState("");

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Send message to backend
  async function sendMessage(text?: string) {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    // Show user message immediately
    addMessage({ role: "user", text: userMessage });

    const res = await fetch("http://localhost:3001/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    const data = await res.json();

    // Extract sources (metadata.source)
    const sources =
      data.context?.map((c: any) => c.metadata?.source).filter(Boolean) || [];

    addMessage({
      role: "bot",
      text:
        data.answer ||
        "I’m not sure, please check with a human support agent.",
      sources,
    });

    setInput("");
  }

  // Voice controls
  function startListening() {
    SpeechRecognition.startListening({ continuous: false });
  }

  function stopListeningOnly() {
    SpeechRecognition.stopListening();
  }

  function sendTranscript() {
    if (transcript.trim()) {
      sendMessage(transcript);
      resetTranscript();
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`${
              m.role === "user" ? "text-right" : "text-left"
            }`}
          >
            {/* Message bubble */}
            <div
              className={`inline-block p-2 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {m.text}
            </div>

            {/* Sources */}
            {m.sources && m.sources.length > 0 && (
              <div className="text-xs text-blue-500 mt-1">
                Sources:{" "}
                {m.sources.map((s: string, i: number) => (
                  <span key={i}>
                    <a
                      href={s}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {s}
                    </a>
                    {i < m.sources.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input + Voice Controls */}
      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 p-2 border rounded"
          value={input || transcript}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aven..."
        />

        {/* Send text button */}
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={() => sendMessage()}
        >
          Send
        </button>

        {/* Voice recording toggle */}
        <button
          className={`p-2 rounded ${
            listening ? "bg-red-500 text-white" : "bg-gray-300"
          }`}
          onClick={listening ? stopListeningOnly : startListening}
        >
          🎤
        </button>

        {/* Send voice transcript after review */}
        {transcript && !listening && (
          <button
            className="p-2 bg-green-500 text-white rounded"
            onClick={sendTranscript}
          >
            ✅
          </button>
        )}
      </div>
    </div>
  );
}
