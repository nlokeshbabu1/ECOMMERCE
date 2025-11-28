import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = ({ sessionId, userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExpandedActions, setShowExpandedActions] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: userEmail 
        ? `Hello ${userEmail.split('@')[0]}! I'm your AI shopping assistant. How can I help you today? You can ask about products, orders, recommendations, or account information.` 
        : "Hello! I'm your AI shopping assistant. How can I help you today? You can ask about products, orders, recommendations, or account information.", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = window.API_BASE_URL || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to format bot messages with proper line breaks and lists
  const formatBotMessage = (text, sender) => {
    if (sender === 'user') {
      return <p className="text-sm">{text}</p>;
    }

    // Handle line breaks
    const lines = text.split('\n');
    
    return (
      <div className="text-sm">
        {lines.map((line, index) => {
          // Handle numbered lists
          if (/^\d+\.\s/.test(line)) {
            return (
              <div key={index} className="flex mb-1">
                <span className="font-medium mr-1">{line.substring(0, line.indexOf(' ') + 1)}</span>
                <span>{line.substring(line.indexOf(' ') + 1)}</span>
              </div>
            );
          }
          // Handle bullet points
          else if (/^- /.test(line)) {
            return (
              <div key={index} className="flex mb-1">
                <span className="mr-2">•</span>
                <span>{line.substring(2)}</span>
              </div>
            );
          }
          // Handle bold text
          else if (/\*\*(.*?)\*\*/.test(line)) {
            const parts = line.split(/\*\*(.*?)\*\*/);
            return (
              <p key={index} className="mb-1">
                {parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
            );
          }
          // Regular paragraph
          else {
            return <p key={index} className="mb-1">{line}</p>;
          }
        })}
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to backend AI
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: inputMessage,
        session_id: sessionId
      });

      // Add bot response to chat
      const botMessage = {
        text: response.data.reply,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

    // Enhanced quick action buttons with more options
  const quickActions = [
    { 
      text: "Track my order", 
      message: "Where is my order?",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      text: "Best deals", 
      message: "Recommend affordable products",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      text: "Account details", 
      message: "Show my account information",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      text: "Return policy", 
      message: "What is your return policy?",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
  ];

  // Additional quick actions for expanded menu
  const expandedActions = [
    { 
      text: "Order history", 
      message: "Show my order history",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      text: "Men's fashion", 
      message: "Recommend men's clothing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      text: "Women's fashion", 
      message: "Recommend women's clothing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    { 
      text: "Kids wear", 
      message: "Recommend kids clothing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Chat Icon/Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            !
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md h-96 flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-300">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">AI Shopping Assistant</h3>
                  <p className="text-xs opacity-80">24/7 Customer Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs opacity-80">Online</span>
                <button
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  {formatBotMessage(message.text, message.sender)}
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="mb-4 flex justify-start">
                <div className="bg-white text-gray-800 rounded-xl rounded-bl-none px-4 py-2 border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions - show basic actions initially, then expanded actions */}
          {messages.filter(m => m.sender === 'user').length === 0 && (
            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
              {showExpandedActions ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Popular Queries</h4>
                    <button 
                      onClick={() => setShowExpandedActions(false)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Show Less
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[...quickActions, ...expandedActions].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputMessage(action.message);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="text-xs bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-300 flex items-center"
                      >
                        {action.icon}
                        <span className="truncate">{action.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Quick Help</h4>
                    <button 
                      onClick={() => setShowExpandedActions(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Show More
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputMessage(action.message);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="text-xs bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-300 flex items-center"
                      >
                        {action.icon}
                        <span className="truncate">{action.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                rows="1"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={`p-2 rounded-lg ${
                  inputMessage.trim() && !isTyping
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-colors duration-300`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;