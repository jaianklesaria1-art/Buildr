"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | Date;
};

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function Chat({
  matchId,
  currentUserId,
  counterpartName,
  initialMessages,
  requiresNda,
  ndaAccepted,
}: {
  matchId: string;
  currentUserId: string;
  counterpartName: string;
  initialMessages: Message[];
  requiresNda: boolean;
  ndaAccepted: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [ndaDone, setNdaDone] = useState(ndaAccepted);
  const [ndaSubmitting, setNdaSubmitting] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const locked = requiresNda && !ndaDone;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function acceptNda() {
    setNdaSubmitting(true);
    const res = await fetch(`/api/matches/${matchId}/nda`, { method: "POST" });
    setNdaSubmitting(false);
    if (res.ok) setNdaDone(true);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setSending(true);

    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setSending(false);

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
    } else {
      setDraft(body);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {locked && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-4">
          <div className="mx-auto max-w-lg">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Soft NDA required
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
              Before sharing idea details, both sides agree to keep what&apos;s discussed here
              confidential and not use it outside a potential collaboration. Not a substitute for
              a legal NDA — just clear expectations up front.
            </p>
            <button
              onClick={acceptNda}
              disabled={ndaSubmitting}
              className="mt-3 rounded-full bg-amber-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {ndaSubmitting ? "Agreeing…" : "I agree — unlock chat"}
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-neutral-600">You matched with {counterpartName}</p>
            <p className="mt-1 text-sm text-neutral-400">Send the first message to break the ice.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m, i) => {
              const mine = m.senderId === currentUserId;
              const prev = messages[i - 1];
              const showTime = !prev || new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000;
              return (
                <div key={m.id}>
                  {showTime && (
                    <p className="my-2 text-center text-xs text-neutral-400">{formatTime(m.createdAt)}</p>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      mine
                        ? "ml-auto rounded-br-md bg-neutral-900 text-white"
                        : "rounded-bl-md bg-white text-neutral-900"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            className="flex-1 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-neutral-400 focus:bg-white disabled:opacity-60"
            placeholder={locked ? "Accept the NDA to start chatting" : "Type a message"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={locked}
          />
          <button
            type="submit"
            disabled={locked || sending || !draft.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
