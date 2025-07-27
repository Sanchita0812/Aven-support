import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";

interface VapiChatProps {
  onMessage: (message: string, isUser: boolean) => void;
}

export default function VapiChat({ onMessage }: VapiChatProps) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Vapi with your public key
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on("call-start", () => {
      console.log("✅ Call started");
      setIsCallActive(true);
      setIsLoading(false);
    });

    vapiInstance.on("call-end", () => {
      console.log("🛑 Call ended");
      setIsCallActive(false);
      setIsLoading(false);
    });

    vapiInstance.on("speech-start", () => {
      console.log("🎙️ User started speaking");
    });

    vapiInstance.on("speech-end", () => {
      console.log("✅ User stopped speaking");
    });

    vapiInstance.on("message", (message: any) => {
      console.log("📩 Message from Gemini:", message);

      // If it's a transcript (user speech converted to text)
      if (message.type === "transcript" && message.transcriptType === "final") {
        if (message.transcript) {
          onMessage(message.transcript, true); // user message
        }
      }

      // If it's Gemini’s response
      if (message.type === "response" && message.text) {
        onMessage(message.text, false); // AI response
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("❌ Vapi error:", error);
      setIsLoading(false);
      setIsCallActive(false);
    });

    return () => {
      vapiInstance.stop(); // Cleanup
    };
  }, [onMessage]);

  const startCall = async () => {
    if (!vapi) return;
    setIsLoading(true);

    try {
      await vapi.start({
        model: {
          provider: "google", // ✅ Gemini provider
          model: "gemini-1.5-flash",
          messages: [
            {
              role: "system",
              content: `You are Aven's AI support agent. 
              Answer concisely and helpfully about Aven's services.`
            }
          ]
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer"
        },
        firstMessage: "Hi! I'm Aven's AI support agent powered by Gemini. How can I help you today?"
      });
    } catch (error) {
      console.error("❌ Failed to start Gemini call:", error);
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  // UI States
  if (isLoading) {
    return (
      <button
        disabled
        className="bg-gray-700 border border-gray-600 rounded-2xl px-6 py-3 text-white text-lg font-medium opacity-50 cursor-not-allowed"
      >
        Connecting to Gemini...
      </button>
    );
  }

  if (isCallActive) {
    return (
      <button
        onClick={endCall}
        className="bg-red-600 hover:bg-red-700 border border-red-500 rounded-2xl px-6 py-3 text-white text-lg font-medium transition-colors"
      >
        End Voice Chat
      </button>
    );
  }

  return (
    <button
      onClick={startCall}
      className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-2xl px-6 py-3 text-white text-lg font-medium transition-colors"
    >
      Start Voice Chat
    </button>
  );
}
