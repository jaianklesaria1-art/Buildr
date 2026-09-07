"use client";

import { useEffect, useState } from "react";

export default function TypingWord({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const typingSpeed = deleting ? 45 : 90;
    const atEnd = !deleting && charIndex === current.length;
    const atStart = deleting && charIndex === 0;

    const delay = atEnd ? 1400 : atStart ? 300 : typingSpeed;

    const timer = setTimeout(() => {
      if (atEnd) {
        setDeleting(true);
      } else if (atStart) {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      } else {
        setCharIndex((i) => i + (deleting ? -1 : 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [charIndex, deleting, wordIndex, words]);

  const text = words[wordIndex % words.length].slice(0, charIndex);

  return (
    <span>
      {text}
      <span className="animate-pulse text-current">|</span>
    </span>
  );
}
