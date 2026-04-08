import React from "react";

interface BasicNextUICardProps {
  text: string;
  className?: string;
}

export default function BasicUICard(props: BasicNextUICardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/95 shadow-sm ${props.className ?? ""}`}>
      <div className="px-4 py-3">
        <p>{props.text}</p>
      </div>
    </div>
  );
}
