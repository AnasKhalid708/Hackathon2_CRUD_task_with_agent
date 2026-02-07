'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, MessageSquare, X } from 'lucide-react';
import { Button } from './ui/Button';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface CustomChatboxProps {
  userId: string;
  apiUrl?: string;
}

export default function CustomChatbox({ userId, apiUrl = 'http://localhost:8000' }: CustomChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: 'Hello! I\'m TaskMaster AI. I can help you manage your tasks. Try saying "Show all tasks" or "Create a task".',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add auth token
        },
        body: JSON.stringify({
          message: input,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();
      
      const agentMessage: Message = {
        role: 'agent',
        content: data.response || 'Sorry, I couldn\'t process that request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center group hover:scale-110 z-50"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">TaskMaster AI</h3>
              <p className="text-xs opacity-90">Your intelligent assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? 'Listening...' : 'Type your message...'}
                className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || isListening}
              />
              
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
