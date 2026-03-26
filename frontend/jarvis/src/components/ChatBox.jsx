import { useEffect, useRef, useCallback } from "react";
import Message from "./Message";

export default function ChatBox({ messages }) {
  const bottomRef = useRef(null);
  const chatRef = useRef(null);

  // ✅ FIXED: Proper scroll behavior
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div ref={chatRef} className="space-y-4 flex flex-col h-full">
      {messages.map((msg, index) => (
        <Message
          key={index}
          role={msg.role}
          text={msg.text}
          loading={msg.loading}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}