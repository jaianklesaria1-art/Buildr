"use client";

import { useState } from "react";

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | Date;
};

export default function Chat({
  matchId,
  currentUserId,
  initialMessages,
  requiresNda,
  ndaAccepted,
}: {
  matchId: string;
  currentUserId: string;
  initialMessages: Message[];
  requiresNda: boolean;
  ndaAccepted: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [ndaDone, setNdaDone] = useState(ndaAccepted);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const locked = requiresNda && !ndaDone;

  async function acceptNda() {
    const res = await fetch(`/api/matches/${matchId}/nda`, { method: "POST" });
    if (res.ok) setNdaDone(true);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);

    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    setSending(false);

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setDraft("");
    }
  }

  return (
    <div className="mt-6 flex flex-1 flex-col">
      {locked && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-900">Soft NDA required</p>
          <p className="mt-1 text-amber-800">
            Before sharing idea details in this chat, both sides agree to keep what&apos;s
            discussed here confidential and not use it outside a potential collaboration.
            This isn&apos;t a substitute for a legal NDA, but sets clear expectations.
          </p>
          <button
            onClick={acceptNda}
            className="mt-3 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            I agree — unlock chat
          </button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border border-neutral-200 p-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.senderId === currentUserId
                ? "ml-auto bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-900"
            }`}
          >
            {m.body}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          placeholder={locked ? "Accept the NDA to start chatting" : "Type a message"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={locked}
        />
        <button
          type="submit"
          disabled={locked || sending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
