import { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiChatProps {
  onMessage: (message: string, isUser: boolean) => void;
}

export default function VapiChat({ onMessage }: VapiChatProps) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
      setIsLoading(false);
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setIsLoading(false);
    });

    vapiInstance.on('speech-start', () => {
      console.log('User started speaking');
    });

    vapiInstance.on('speech-end', () => {
      console.log('User stopped speaking');
    });

    vapiInstance.on('message', (message: any) => {
      console.log('Message:', message);
      
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        // User's final transcript
        if (message.transcript) {
          onMessage(message.transcript, true);
        }
      }
      
      if (message.type === 'function-call') {
        // Handle function calls if needed
        console.log('Function call:', message);
      }
    });

    vapiInstance.on('error', (error: any) => {
      console.error('Vapi error:', error);
      setIsLoading(false);
      setIsCallActive(false);
    });

    return () => {
      vapiInstance.stop();
    };
  }, [onMessage]);

  const startCall = async () => {
    if (!vapi) return;
    
    setIsLoading(true);
    
    try {
      await vapi.start({
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are Aven's AI support agent. You help users with questions about Aven's services. 
              Keep responses concise and helpful. If you need to look up specific information, 
              you can call the search function to get relevant context from Aven's support documentation.`
            }
          ],
          functions: [
            {
              name: 'search_support',
              description: 'Search Aven support documentation for relevant information',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The search query to find relevant support information'
                  }
                },
                required: ['query']
              }
            }
          ]
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: "Hi! I'm Aven's AI support agent. How can I help you today?"
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="bg-gray-700 border border-gray-600 rounded-2xl px-6 py-3 text-white text-lg font-medium opacity-50 cursor-not-allowed"
      >
        Connecting...
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