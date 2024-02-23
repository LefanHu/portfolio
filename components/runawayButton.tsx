"use client";

import Link from "next/link";
import { useRef, useState } from "react";

interface ButtonProps {
  href: string;
}

const messages: string[] = [
  "easter egg",
  "you thought?",
  "can't catch me now",
  "i tried really hard bro",
  "miss u",
  "love u",
  "happy birthday silly goose",
];

export default function RunawayButton(props: ButtonProps) {
  const [isHovering, setIsHovered] = useState(false);
  const [buttonStyle, setButtonStyle] = useState({});
  const [messageIndex, setMessageIndex] = useState(0);
  const buttonRef = useRef<HTMLInputElement>(null);

  const moveButton = () => {
    if (!buttonRef || !buttonRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();

    const maxX = window.innerWidth - buttonRect.width; // Max X position
    const maxY = window.innerHeight - buttonRect.height; // Max Y position

    const x = Math.random() * maxX;
    const y = Math.random() * (maxY - 40) + 40;

    setButtonStyle({
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      transition: "left 0.3s ease, top 0.3s ease",
    });
  };

  const onMouseEnter = () => {
    setIsHovered(true);

    if (messageIndex == messages.length - 1) return;
    moveButton();
    setMessageIndex(messageIndex + 1);
  };
  const onMouseLeave = () => setIsHovered(false);
  return (
    <Link href={props.href}>
      <div className="z-200 flex items-center justify-center gap-x-6">
        <div
          style={buttonStyle}
          ref={buttonRef}
          className="rounded-md flex-shrink bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {messages[messageIndex]}
        </div>
      </div>
    </Link>
  );
}
