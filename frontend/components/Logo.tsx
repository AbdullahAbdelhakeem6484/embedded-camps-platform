import React from "react";

interface LogoProps {
  className?: string;
  variant?: "square" | "horizontal";
}

export default function Logo({ className = "h-12 w-auto", variant = "square" }: LogoProps) {
  const letters = ["E", "M", "B", "E", "D", "D", "E", "D"];

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <svg
          viewBox="0 0 240 60"
          className="h-full w-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ─── HORIZONTAL LAYOUT: ICON (Left) ─── */}
          <g stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Sun */}
            <circle cx="16" cy="18" r="4.5" fill="#fbbf24" strokeWidth="1.5" />
            <line x1="16" y1="10" x2="16" y2="8" />
            <line x1="16" y1="26" x2="16" y2="28" />
            <line x1="8" y1="18" x2="6" y2="18" />
            <line x1="24" y1="18" x2="26" y2="18" />
            <line x1="10.5" y1="12.5" x2="9" y2="11" />
            <line x1="21.5" y1="23.5" x2="23" y2="25" />
            <line x1="21.5" y1="12.5" x2="23" y2="11" />
            <line x1="10.5" y1="23.5" x2="9" y2="25" />

            {/* Tent Poles */}
            <line x1="26" y1="46" x2="57" y2="17" strokeWidth="2.2" />
            <line x1="59" y1="46" x2="28" y2="17" strokeWidth="2.2" />
            
            {/* Ground Line */}
            <line x1="20" y1="46" x2="78" y2="46" strokeWidth="1.5" />
          </g>

          {/* Tent Canopy */}
          <path
            d="M 30 46 L 43 25 L 56 46 Z"
            fill="#fbbf24"
            opacity="0.95"
          />
          {/* Entrance Cutout */}
          <path
            d="M 39 46 L 43 38 L 47 46 Z"
            fill="var(--background)"
          />

          {/* Pine Tree */}
          <g fill="#fbbf24" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="70" y1="46" x2="70" y2="35" strokeWidth="2.2" />
            <path d="M 64 39 L 70 31 L 76 39 Z" />
            <path d="M 66 33 L 70 26 L 74 33 Z" />
            <path d="M 68 28 L 70 22 L 72 28 Z" />
          </g>

          {/* ─── HORIZONTAL LAYOUT: TEXT (Right) ─── */}
          {/* EMBEDDED Blocks */}
          {letters.map((letter, i) => {
            const startX = 88;
            const blockWidth = 16;
            const gap = 1.5;
            const x = startX + i * (blockWidth + gap);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={10}
                  width={blockWidth}
                  height={blockWidth}
                  rx="2.5"
                  className="logo-rect"
                />
                <text
                  x={x + blockWidth / 2}
                  y={21.5}
                  textAnchor="middle"
                  fontWeight="900"
                  fontSize="9.5"
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="#b91c1c"
                  className="transition-colors duration-300"
                >
                  {letter}
                </text>
              </g>
            );
          })}

          {/* CAMPS Text */}
          <text
            x="88"
            y="48"
            textLength="138.5"
            lengthAdjust="spacing"
            fontWeight="900"
            fontSize="23.5"
            fontFamily="Inter, system-ui, sans-serif"
            fill="currentColor"
            className="text-foreground transition-colors duration-300"
          >
            CAMPS
          </text>
        </svg>
      </div>
    );
  }

  // SQUARE LAYOUT (Default)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 300 220"
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ─── CAMP ICONS (Always Gold Yellow) ─── */}
        <g stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Sun */}
          <circle cx="85" cy="50" r="10" fill="#fbbf24" strokeWidth="2" />
          <line x1="85" y1="34" x2="85" y2="30" />
          <line x1="85" y1="66" x2="85" y2="70" />
          <line x1="69" y1="50" x2="65" y2="50" />
          <line x1="101" y1="50" x2="105" y2="50" />
          <line x1="74" y1="39" x2="71" y2="36" />
          <line x1="96" y1="61" x2="99" y2="64" />
          <line x1="96" y1="39" x2="99" y2="36" />
          <line x1="74" y1="61" x2="71" y2="64" />

          {/* Tent Poles */}
          <line x1="110" y1="110" x2="185" y2="40" strokeWidth="3" />
          <line x1="190" y1="110" x2="115" y2="40" strokeWidth="3" stroke="#eab308" />
          
          {/* Ground Line */}
          <line x1="100" y1="110" x2="200" y2="110" strokeWidth="2" />
        </g>

        {/* Tent Canopy (Yellow Filled) */}
        <path
          d="M 120 110 L 150 60 L 180 110 Z"
          fill="#fbbf24"
          opacity="0.95"
        />
        {/* Tent Entrance Cutout */}
        <path
          d="M 140 110 L 150 90 L 160 110 Z"
          fill="var(--background)"
        />

        {/* Pine Tree */}
        <g fill="#fbbf24" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Tree Trunk */}
          <line x1="215" y1="110" x2="215" y2="85" strokeWidth="3" />
          {/* Tree Layers */}
          <path d="M 205 95 L 215 82 L 225 95 Z" />
          <path d="M 208 86 L 215 75 L 222 86 Z" />
          <path d="M 211 78 L 215 69 L 219 78 Z" />
        </g>

        {/* ─── EMBEDDED Blocks ─── */}
        {letters.map((letter, i) => {
          const startX = 46;
          const blockWidth = 24;
          const gap = 2;
          const x = startX + i * (blockWidth + gap);
          return (
            <g key={i}>
              {/* Block Square */}
              <rect
                x={x}
                y={120}
                width={blockWidth}
                height={blockWidth}
                rx="3.5"
                className="logo-rect"
              />
              {/* Letter inside */}
              <text
                x={x + blockWidth / 2}
                y={137}
                textAnchor="middle"
                fontWeight="900"
                fontSize="13.5"
                fontFamily="Inter, system-ui, sans-serif"
                fill="#b91c1c"
                className="transition-colors duration-300"
              >
                {letter}
              </text>
            </g>
          );
        })}

        {/* ─── CAMPS Text ─── */}
        <text
          x="46"
          y="185"
          textLength="206"
          lengthAdjust="spacing"
          fontWeight="900"
          fontSize="37"
          fontFamily="Inter, system-ui, sans-serif"
          fill="currentColor"
          className="text-foreground transition-colors duration-300"
        >
          CAMPS
        </text>
      </svg>
    </div>
  );
}
