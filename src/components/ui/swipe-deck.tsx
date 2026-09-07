"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;
const DISCLOSE = {
  type: "spring",
  stiffness: 150,
  damping: 27,
  mass: 1,
} as const;
const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;
const LEAVE = [0.4, 0, 1, 1] as const;

export type SwipeChoice = "left" | "right";

export type SwipeIntent = { dir: -1 | 0 | 1; step: number };

export type SwipeDeckFlow = { dir: -1 | 1; kind: "decide" | "undo" };

const BLANK: SwipeIntent = { dir: 0, step: 0 };

const spent = (out: boolean) => (out ? "opacity-0" : "");

export type UseSwipeDeckOptions = {
  count: number;
  threshold?: number;
  steps?: number;
  flick?: number;
  onDecide?: (index: number, choice: SwipeChoice) => void;
  onUndo?: (index: number) => void;
  disabled?: boolean;
};

export function useSwipeDeck({
  count,
  threshold = 92,
  steps = 6,
  flick = 520,
  onDecide,
  onUndo,
  disabled = false,
}: UseSwipeDeckOptions) {
  const total = Math.max(0, Math.floor(count));
  const grain = Math.max(1, Math.floor(steps));
  const reach = Math.max(1, threshold);

  const [decisions, setDecisions] = useState<SwipeChoice[]>([]);
  const [flow, setFlow] = useState<SwipeDeckFlow>({ dir: 1, kind: "decide" });
  const [intent, setIntent] = useState<SwipeIntent>(BLANK);

  const index = Math.min(decisions.length, total);

  const len = useRef(decisions.length);
  len.current = decisions.length;
  const size = useRef(total);
  size.current = total;
  const made = useRef(decisions);
  made.current = decisions;

  const decided = useRef(onDecide);
  decided.current = onDecide;
  const reverted = useRef(onUndo);
  reverted.current = onUndo;

  const clear = useCallback(() => {
    setIntent((prev) => (prev.step === 0 && prev.dir === 0 ? prev : BLANK));
  }, []);

  const decide = useCallback(
    (choice: SwipeChoice) => {
      if (disabled) return;
      const at = len.current;
      if (at >= size.current) return;
      len.current = at + 1;
      setDecisions((prev) => [...prev, choice]);
      setFlow({ dir: choice === "right" ? 1 : -1, kind: "decide" });
      setIntent(BLANK);
      decided.current?.(at, choice);
    },
    [disabled],
  );

  const undo = useCallback(() => {
    if (disabled) return;
    const at = len.current;
    if (at === 0) return;
    const last = made.current[at - 1];
    len.current = at - 1;
    setDecisions((prev) => prev.slice(0, prev.length - 1));
    setFlow({ dir: last === "right" ? 1 : -1, kind: "undo" });
    setIntent(BLANK);
    reverted.current?.(at - 1);
  }, [disabled]);

  const report = useCallback(
    (dx: number) => {
      const step = Math.min(grain, Math.round((Math.abs(dx) / reach) * grain));
      const dir: -1 | 0 | 1 = step === 0 ? 0 : dx > 0 ? 1 : -1;
      setIntent((prev) =>
        prev.dir === dir && prev.step === step ? prev : { dir, step },
      );
    },
    [grain, reach],
  );

  const release = useCallback(
    (dx: number, vx: number) => {
      const far = Math.abs(dx) >= reach;
      const fast = Math.abs(vx) >= flick && Math.abs(dx) >= reach * 0.35;
      if (!far && !fast) {
        clear();
        return;
      }
      decide((far ? dx : vx) > 0 ? "right" : "left");
    },
    [reach, flick, clear, decide],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        decide("left");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        decide("right");
      } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        undo();
      } else if (event.key === "Escape") {
        clear();
      }
    },
    [decide, undo, clear],
  );

  useEffect(() => {
    const bail = () => clear();
    const hidden = () => document.hidden && clear();
    window.addEventListener("blur", bail);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", bail);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [clear]);

  return {
    index,
    count: total,
    remaining: total - index,
    done: index >= total,
    decisions,
    flow,
    intent,
    steps: grain,
    threshold: reach,
    armed: intent.step >= grain,
    canUndo: decisions.length > 0,
    decide,
    undo,
    clear,
    report,
    release,
    deckProps: {
      role: "group" as const,
      "aria-roledescription": "card deck",
      tabIndex: 0,
      onKeyDown,
    },
  };
}

export type UseSwipeDeckResult = ReturnType<typeof useSwipeDeck>;

const ICON_LEFT = (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
    <line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
  </svg>
);

const ICON_RIGHT = (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <path
      d="M224,110.63,148.37,35A19.85,19.85,0,0,0,120,35L35,120a20,20,0,0,0,0,28.28L120,233a19.86,19.86,0,0,0,28.34,0L224,157.34A20,20,0,0,0,224,110.63Z"
      fill="none"
    />
    <path d="M128,32l16,16-96,96L32,128,128,32Zm0,192a12,12,0,0,1-8.49-3.51L44,145a12,12,0,0,1,0-17l75.51-75.51a12,12,0,0,1,17,0L212,128,136.49,203.49A12,12,0,0,1,128,224Z" />
    <path
      d="M22.83,90.83a4,4,0,0,1,5.66,0L128,190.34,227.51,90.83a4,4,0,1,1,5.66,5.66L131.83,196.83a8,8,0,0,1-11.32,0L18.17,96.49A4,4,0,0,1,22.83,90.83Z"
      fill="currentColor"
    />
  </svg>
);

const ICON_UNDO = (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline points="72 104 24 104 24 56" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M67.6,192.1a88,88,0,1,0,0-128.2L24,104" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type DeckCardProps = {
  depth: number;
  height: number;
  entryX: number;
  active: boolean;
  reduced: boolean;
  label: string;
  leftLabel: string;
  rightLabel: string;
  intent: SwipeIntent;
  steps: number;
  onMove: (dx: number) => void;
  onRelease: (dx: number, vx: number) => void;
  children: React.ReactNode;
};

function DeckCard({
  depth,
  height,
  entryX,
  active,
  reduced,
  label,
  leftLabel,
  rightLabel,
  intent,
  steps,
  onMove,
  onRelease,
  children,
}: DeckCardProps) {
  const x = useMotionValue(entryX);
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10], { clamp: false });
  const fade = useTransform(x, [-340, -150, 0, 150, 340], [0, 1, 1, 1, 0]);

  const skip = useRef(reduced);
  skip.current = reduced;

  useEffect(() => {
    if (x.get() === 0) return;
    const controls = animate(x, 0, skip.current ? { duration: 0 } : DISCLOSE);
    return () => controls.stop();
  }, [x, entryX]);

  const commit = active ? 0 : depth === 1 ? intent.step / steps : 0;
  const y = depth * 14 - commit * 14;
  const scale = 1 - depth * 0.05 + commit * 0.05;

  const badge = (side: -1 | 1, text: string, place: string, color: string) => {
    const on = intent.dir === side;
    return (
      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: on ? intent.step / steps : 0, scale: on ? 1 : 0.9, rotate: side === -1 ? -12 : 12 }}
        transition={reduced ? { duration: 0 } : CELL}
        className={`pointer-events-none absolute top-6 whitespace-nowrap rounded-lg border-[3px] px-3 py-1 text-lg font-extrabold uppercase tracking-wider ${color} ${place}`}
      >
        {text}
      </motion.span>
    );
  };

  return (
    <motion.div
      role="group"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      variants={{
        exit: (dir: number) => ({
          x: dir * 700,
          rotate: dir * 20,
          zIndex: 12,
          transition: reduced
            ? { duration: 0 }
            : { x: { duration: 0.32, ease: LEAVE }, rotate: { duration: 0.32, ease: LEAVE } },
        }),
      }}
      initial={{ y, scale }}
      animate={{ y, scale }}
      exit="exit"
      transition={reduced ? { duration: 0 } : active ? { ...CROSSFADE, delay: 0.1 } : CROSSFADE}
      drag={active ? "x" : false}
      dragDirectionLock
      dragMomentum={false}
      dragElastic={1}
      dragConstraints={{ left: 0, right: 0 }}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 34 }}
      whileDrag={reduced ? undefined : { scale: 1.02 }}
      onDrag={(_event, info) => onMove(info.offset.x)}
      onDragEnd={(_event, info) => onRelease(info.offset.x, info.velocity.x)}
      style={{
        x,
        rotate,
        opacity: fade,
        height,
        zIndex: 10 - depth,
        transformOrigin: "50% 100%",
        touchAction: "pan-y",
      }}
      className={`absolute inset-x-0 top-0 select-none overflow-hidden rounded-2xl border border-neutral-200 bg-white ${
        active
          ? "cursor-grab shadow-[0_8px_40px_-8px_rgba(0,0,0,0.25)] active:cursor-grabbing"
          : "shadow-[0_2px_16px_-4px_rgba(0,0,0,0.12)]"
      }`}
    >
      {children}
      {active ? badge(-1, leftLabel, "left-6", "border-red-500 text-red-500 bg-white/90") : null}
      {active ? badge(1, rightLabel, "right-6", "border-green-500 text-green-500 bg-white/90") : null}
    </motion.div>
  );
}

export type SwipeDeckProps<T> = {
  items: readonly T[];
  itemKey: (item: T) => string;
  itemLabel: (item: T) => string;
  children: (item: T) => React.ReactNode;
  onDecide?: (item: T, choice: SwipeChoice) => void;
  onUndo?: (item: T) => void;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  undoLabel?: string;
  emptyLabel?: string;
  height?: number;
  threshold?: number;
  steps?: number;
  peek?: number;
  className?: string;
};

export function SwipeDeck<T>({
  items,
  itemKey,
  itemLabel,
  children,
  onDecide,
  onUndo,
  label = "Card deck",
  leftLabel = "Pass",
  rightLabel = "Like",
  undoLabel = "Undo",
  emptyLabel = "No more cards",
  height = 480,
  threshold = 100,
  steps = 6,
  peek = 3,
  className = "",
}: SwipeDeckProps<T>) {
  const hintId = useId();
  const reduced = useReducedMotion() === true;

  const deck = useSwipeDeck({
    count: items.length,
    threshold,
    steps,
    onDecide: (at, choice) => {
      const item = items[at];
      if (item !== undefined) onDecide?.(item, choice);
    },
    onUndo: (at) => {
      const item = items[at];
      if (item !== undefined) onUndo?.(item);
    },
  });

  const stack = items.slice(deck.index, deck.index + Math.max(1, peek));
  const current = items[deck.index];

  const control =
    "inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition-transform hover:scale-105 active:scale-95";

  return (
    <div className={`w-full ${className}`}>
      <div
        aria-label={label}
        aria-describedby={hintId}
        style={{ height }}
        className="relative w-full outline-none"
        {...deck.deckProps}
      >
        <motion.div
          aria-hidden={!deck.done}
          initial={false}
          animate={{ opacity: deck.done ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : CROSSFADE}
          style={{ height }}
          className="absolute inset-0 z-0 grid place-items-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center text-sm text-neutral-500"
        >
          {emptyLabel}
        </motion.div>
        <AnimatePresence initial={false} custom={deck.flow.dir}>
          {stack.map((item, depth) => (
            <DeckCard
              key={itemKey(item)}
              depth={depth}
              height={height}
              entryX={depth === 0 && deck.flow.kind === "undo" ? deck.flow.dir * 700 : 0}
              active={depth === 0}
              reduced={reduced}
              label={itemLabel(item)}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              intent={deck.intent}
              steps={deck.steps}
              onMove={deck.report}
              onRelease={deck.release}
            >
              {children(item)}
            </DeckCard>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => deck.decide("left")}
          inert={deck.done}
          aria-label={leftLabel}
          className={`${control} !h-14 !w-14 text-red-500 ${spent(deck.done)}`}
        >
          {ICON_LEFT}
        </button>
        <button
          type="button"
          onClick={deck.undo}
          inert={!deck.canUndo}
          aria-label={undoLabel}
          className={`${control} text-amber-500 ${spent(!deck.canUndo)}`}
        >
          {ICON_UNDO}
        </button>
        <button
          type="button"
          onClick={() => deck.decide("right")}
          inert={deck.done}
          aria-label={rightLabel}
          className={`${control} !h-14 !w-14 text-green-500 ${spent(deck.done)}`}
        >
          {ICON_RIGHT}
        </button>
      </div>

      <p aria-live="polite" aria-atomic className="sr-only">
        {deck.done || current === undefined
          ? emptyLabel
          : `${itemLabel(current)}. Card ${deck.index + 1} of ${items.length}.`}
      </p>
      <span id={hintId} className="sr-only">
        Left and right arrow keys decide the top card. Backspace brings the last one back.
      </span>
    </div>
  );
}

export default SwipeDeck;
