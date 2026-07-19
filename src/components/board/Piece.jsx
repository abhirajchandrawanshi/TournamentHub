import { useState } from "react";

const initialMessages = [
  {
    user: "System",
    text: "Welcome to the Arena!",
  },
  {
    user: "Magnus",
    text: "Good luck everyone.",
  },
  {
    user: "Hikaru",
    text: "Let's play!",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        user: "You",
        text: input,
      },
    ]);

    setInput("");
  };

  return (
    <div className="glass arena-chat">

      <h3>Live Chat</h3>

      <div className="chat-list">
        {messages.map((msg, index) => (
          <div key={index} className="chat-item">
            <strong>{msg.user}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">

        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={sendMessage}
        >
          Send
        </button>

      </div>

    </div>
  );
}