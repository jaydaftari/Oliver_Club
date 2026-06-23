"use client";

import { useEffect, useRef } from "react";

const PHOTOS = [
  {
    src: "https://vavrykworld.com/wp-content/uploads/2026/06/IMG_4432-2-scaled.jpg",
    alt: "Olivier Club members hiking",
  },
  {
    src: "https://vavrykworld.com/wp-content/uploads/2026/06/FullSizeRender-2-scaled.jpg",
    alt: "Olivier Club members on the trail",
  },
  {
    src: "https://vavrykworld.com/wp-content/uploads/2026/06/IMG_4332-2-scaled.jpg",
    alt: "Olivier Club members at the summit",
  },
];

// Fixed resting offsets/rotations for the fanned look (front → back).
const REST = [
  { x: 0, y: 0, r: -3 },
  { x: 26, y: 14, r: 2.5 },
  { x: -20, y: 26, r: -1 },
];

/**
 * Draggable polaroid stack — drag the top card away to fling it to the back.
 * Ported from the design's vanilla script into a self-contained React island.
 */
export default function PhotoStack() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const cards = Array.from(stack.querySelectorAll<HTMLElement>(".stack-card"));
    const N = cards.length;
    const order = cards.map((_, i) => i); // order[0] is front-most
    let drag: { card: HTMLElement; startX: number; startY: number; dx: number; dy: number } | null =
      null;

    function layout() {
      order.forEach((cardIdx, pos) => {
        const card = cards[cardIdx];
        const rest = REST[Math.min(pos, REST.length - 1)];
        card.style.transform = `translate(-50%, -50%) translate(${rest.x}px, ${rest.y}px) rotate(${rest.r}deg)`;
        card.style.zIndex = String(N - pos);
        card.style.cursor = pos === 0 ? "grab" : "default";
      });
    }
    layout();

    function onDown(e: MouseEvent | TouchEvent) {
      const card = cards[order[0]];
      const target = e.target as Node;
      if (!card.contains(target)) return;
      const pt = "touches" in e ? e.touches[0] : e;
      drag = { card, startX: pt.clientX, startY: pt.clientY, dx: 0, dy: 0 };
      card.classList.add("dragging");
      card.style.transition = "box-shadow 0.3s";
      e.preventDefault();
    }
    function onMove(e: MouseEvent | TouchEvent) {
      if (!drag) return;
      const pt = "touches" in e ? e.touches[0] : e;
      drag.dx = pt.clientX - drag.startX;
      drag.dy = pt.clientY - drag.startY;
      const rot = -3 + drag.dx * 0.04;
      drag.card.style.transform = `translate(-50%, -50%) translate(${drag.dx}px, ${drag.dy}px) rotate(${rot}deg)`;
    }
    function onUp() {
      if (!drag) return;
      const card = drag.card;
      card.classList.remove("dragging");
      card.style.transition = "transform 0.5s cubic-bezier(.2,.7,.2,1), box-shadow 0.3s";
      const threshold = 90;
      if (Math.abs(drag.dx) > threshold || Math.abs(drag.dy) > threshold) {
        const dir = drag.dx >= 0 ? 1 : -1;
        card.style.transform = `translate(-50%, -50%) translate(${dir * 520}px, ${drag.dy}px) rotate(${dir * 18}deg)`;
        window.setTimeout(() => {
          order.push(order.shift() as number);
          layout();
        }, 260);
      } else {
        layout();
      }
      drag = null;
    }

    stack.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    stack.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      stack.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      stack.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      className="photo-stack"
      id="photoStack"
      aria-label="Hiking photos — drag to browse"
      ref={stackRef}
    >
      {PHOTOS.map((p, i) => (
        <figure className="polaroid stack-card" data-i={i} key={p.src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="side-img" src={p.src} alt={p.alt} loading="lazy" draggable={false} />
        </figure>
      ))}
    </div>
  );
}
