import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import InputBox from "../components/InputBox";

export default function Home() {
  // 🔥 Chat History + Current Chat State
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello, I am Jarvis. How can I assist you?" }
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("jarvis-chats");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
        setMessages(parsedChats[0].messages);
      }
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("jarvis-chats", JSON.stringify(chats));
    }
  }, [chats]);

  // Switch to existing chat
  const loadChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setSidebarOpen(false);
    }
  };

  // New chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [{ role: "bot", text: "Hello, I am Jarvis. How can I assist you?" }]
    };
    setChats([newChat, ...chats]);
    setMessages(newChat.messages);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
  };

  // Update chat title based on first user message
  const updateChatTitle = (chatId, title) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const sendMessage = async (text, isVoice = false) => {
    // Add user message
    const userMsg = { role: "user", text };
    const loadingMsg = { role: "bot", loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();

      // Replace loading with response
      setMessages(prev => {
        const updated = [...prev];
        updated.pop(); // remove loading
        updated.push({ role: "bot", text: data.text });
        return updated;
      });

      // Update current chat in chats list
      setChats(prev => 
        prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: updated }
            : chat
        )
      );

      // Update title from first user message
      if (chats.length === 0 || !currentChatId) {
        updateChatTitle(Date.now().toString(), text.slice(0, 30));
      }

      if (isVoice) speak(data.text);

    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        updated.push({ role: "bot", text: "Sorry, something went wrong!" });
        return updated;
      });
    }
  };

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 flex">
      {/* 🔥 Sidebar */}
      <div 
        className={`
          w-80 bg-slate-900/95 backdrop-blur-lg border-r border-slate-800
          flex flex-col transition-all duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-72
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Chats</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className="mx-3 mt-3 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-xl font-medium transition-all flex items-center gap-2"
        >
          ➕ New Chat
        </button>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat.id)}
              className={`
                w-full text-left p-3 rounded-lg transition-all
                ${currentChatId === chat.id 
                  ? 'bg-cyan-500/20 border-r-4 border-cyan-400' 
                  : 'hover:bg-slate-800 text-slate-300'
                }
              `}
            >
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-xs text-slate-500 truncate">
                {chat.messages[chat.messages.length - 1]?.text.slice(0, 50)}...
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-4 bg-slate-900/50 border-b border-slate-800"
        >
          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Jarvis AI
          </h1>
          {currentChat && (
            <div className="text-sm text-slate-400 ml-auto">
              {currentChat.title}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-950/50">
            <ChatBox messages={messages} />
          </div>
          <InputBox onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}