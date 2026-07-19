"use client";

import { useState } from "react";

export default function GameChat() {
  const [message, setMessage] = useState("");

  const messages = [
    { user: "Rahul", text: "Good Luck!" },
    { user: "You", text: "Have Fun!" },
  ];

  return (
    <div className="bg-[#141922] border border-gray-800 rounded-xl p-5">

      <h2 className="text-xl font-bold mb-4">
        Live Chat
      </h2>

      <div className="h-48 overflow-y-auto space-y-2 mb-4">

        {messages.map((msg, i) => (
          <p key={i}>
            <span className="text-green-400">{msg.user}:</span> {msg.text}
          </p>
        ))}

      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        className="w-full bg-[#0B0D12] p-3 rounded-lg border border-gray-700"
      />

    </div>
  );
}