import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RadarDataPoint {
  label: string;
  subLabel: string;
  value: number;
  valueB?: number; // Optional for compare mode
}

interface RadarChartProps {
  data: RadarDataPoint[];
  colorA?: string;
  colorB?: string;
  nameA?: string;
  nameB?: string;
  interactive?: boolean;
  onValueChange?: (index: number, newValue: number) => void;
}

export default function RadarChart({
  data,
  colorA = "#2d2a26", // Classy deep ink charcoal
  colorB = "#5c7a70", // Chinese antique sage green
  nameA = "文段 A",
  nameB = "文段 B",
  interactive = false,
  onValueChange,
}: RadarChartProps) {
  const [scaleProgress, setScaleProgress] = useState(0);

  const getDescriptor = (label: string, value: number) => {
    if (label === "温度") return value >= 67 ? "暖调" : value >= 34 ? "温和" : "冷调";
    if (label === "密度") return value >= 67 ? "繁密" : value >= 34 ? "匀实" : "疏朗";
    if (label === "透明度") return value >= 67 ? "幽深" : value >= 34 ? "清透" : "直白";
    if (label === "余韵") return value >= 67 ? "沉潜" : value >= 34 ? "回甘" : "即散";
    if (label === "张力") return value >= 67 ? "紧绷" : value >= 34 ? "含张力" : "松弛";
    if (label === "意象域") return value >= 67 ? "抽象" : value >= 34 ? "兼具" : "具象";
    if (label === "时间感") return value >= 67 ? "延绵" : value >= 34 ? "舒展" : "凝缩";
    if (label === "诚实度") return value >= 67 ? "表演感" : value >= 34 ? "克制" : "坦露";
    if (label === "文化层") return value >= 67 ? "新变" : value >= 34 ? "兼容" : "传统";
    return "";
  };

  // Trigger smooth radial opening transition
  useEffect(() => {
    setScaleProgress(0);
    const timer = setTimeout(() => {
      setScaleProgress(1); // Triggers growth to target values
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const size = 320;
  const padding = 55;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size / 2) - padding;

  const totalPoints = data.length;

  // Coordinate generator
  const getCoordinates = (index: number, val: number, progress = 1) => {
    const angle = (index * 2 * Math.PI) / totalPoints - Math.PI / 2;
    const r = maxRadius * (val / 100) * progress;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // Ring background guidelines
  const gridRings = [20, 40, 60, 80, 100];

  // Radar chart polygon points string
  const pointsAStr = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.value, scaleProgress);
      return `${x},${y}`;
    })
    .join(" ");

  const hasB = data.some((d) => d.valueB !== undefined);
  const pointsBStr = hasB
    ? data
        .map((d, i) => {
          const { x, y } = getCoordinates(i, d.valueB || 0, scaleProgress);
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  // For interactive dragging handler on drag dots in interactive mode (Mode D)
  const handlePointDrag = (e: React.MouseEvent<SVGCircleElement> | React.TouchEvent<SVGCircleElement>, index: number) => {
    if (!interactive || !onValueChange) return;

    const svgElement = e.currentTarget.ownerSVGElement;
    if (!svgElement) return;

    const updateValue = (clientX: number, clientY: number) => {
      const rect = svgElement.getBoundingClientRect();
      const x = clientX - rect.left - (rect.width / 2);
      const y = clientY - rect.top - (rect.height / 2);

      // Angle calculation
      const angle = Math.atan2(y, x) + Math.PI / 2;
      let targetIndex = Math.round((angle * totalPoints) / (2 * Math.PI));
      if (targetIndex < 0) targetIndex += totalPoints;
      targetIndex = targetIndex % totalPoints;

      // Distance calculation (radius) to score (0-100)
      const dist = Math.sqrt(x*x + y*y);
      const scaleFactor = rect.width / size;
      const targetRadius = dist / scaleFactor;
      const computedValue = Math.min(100, Math.max(0, Math.round((targetRadius / maxRadius) * 100)));

      // Call back changes to specific dimension index or nearest one
      onValueChange(index, computedValue);
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateValue(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    const onTouchMove = (touchEvent: TouchEvent) => {
      if (touchEvent.touches.length > 0) {
        updateValue(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };

    if (e.type === "mousedown") {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[460px] mx-auto md:max-w-none">
      <div className="relative w-full aspect-square flex items-center justify-center p-1 bg-white/20 rounded-full backdrop-blur-[1px] border border-[#2d2a26]/5 shadow-[inset_0_2px_8px_rgba(45,42,38,0.02)]">
        
        {/* Radar SVG */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full p-1 h-auto max-w-[460px] overflow-visible"
        >
          {/* Defs for soft organic gradient filters to match premium editorial poster aesthetics */}
          <defs>
            <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#2d2a26" stopOpacity={0.01} />
            </radialGradient>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={colorA} floodOpacity="0.08" />
            </filter>
            {hasB && (
              <filter id="softShadowB" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={colorB} floodOpacity="0.08" />
              </filter>
            )}
          </defs>

          {/* Background concentric rings */}
          {gridRings.map((r, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={maxRadius * (r / 100)}
              fill="none"
              stroke="#2d2a26"
              strokeWidth="0.5"
              strokeOpacity={i === gridRings.length - 1 ? 0.2 : 0.08}
              strokeDasharray={i !== gridRings.length - 1 ? "2,2" : undefined}
            />
          ))}

          {/* 100% boundary axis ticks */}
          {gridRings.map((r, i) => (
            <text
              key={i}
              x={centerX}
              y={centerY - maxRadius * (r / 100) + 3}
              fontSize="8"
              fill="#2d2a26"
              fillOpacity="0.3"
              className="font-mono text-[8px]"
              textAnchor="middle"
            >
              {r}
            </text>
          ))}

          {/* Cross lines from center */}
          {data.map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#2d2a26"
                strokeWidth="0.5"
                strokeOpacity="0.12"
              />
            );
          })}

          {/* Polygon A - Main Ink */}
          <g filter="url(#softShadow)">
            <motion.polygon
              points={pointsAStr}
              fill={`${colorA}12`} // Extra delicate transparency
              stroke={colorA}
              strokeWidth="1.75"
              strokeLinejoin="round"
              animate={{ fillOpacity: scaleProgress ? 0.12 : 0 }}
              transition={{ duration: 0.8 }}
            />
          </g>

          {/* Polygon B - Secondary (Antique Green - Sage) */}
          {hasB && (
            <g filter="url(#softShadowB)">
              <motion.polygon
                points={pointsBStr}
                fill={`${colorB}15`}
                stroke={colorB}
                strokeWidth="1.75"
                strokeLinejoin="round"
                animate={{ fillOpacity: scaleProgress ? 0.15 : 0 }}
                transition={{ duration: 0.8 }}
              />
            </g>
          )}

          {/* Labels with adaptive text-anchoring for perfect typography flow */}
          {data.map((d, i) => {
            const angle = (i * 2 * Math.PI) / totalPoints - Math.PI / 2;
            const textRadius = maxRadius + 18;
            const tx = centerX + textRadius * Math.cos(angle);
            const ty = centerY + textRadius * Math.sin(angle);

            // Anchor determination
            let textAnchor = "middle";
            const cosAngle = Math.cos(angle);
            if (cosAngle > 0.15) textAnchor = "start";
            else if (cosAngle < -0.15) textAnchor = "end";

            // Y-offset adjustments
            let yOffset = 3;
            if (Math.sin(angle) > 0.85) yOffset = 10;
            if (Math.sin(angle) < -0.85) yOffset = -5;

            return (
              <g key={i}>
                <text
                  x={tx}
                  y={ty + yOffset}
                  style={{ textAnchor } as React.CSSProperties}
                  fontSize="11"
                  fontWeight="500"
                  fill="#2d2a26"
                  fontFamily="Georgia, 'Times New Roman', 'Songti SC', serif"
                  letterSpacing="-0.01em"
                  className="transition-all duration-300"
                >
                  {d.label}
                </text>
                <text
                  x={tx}
                  y={ty + yOffset + 9}
                  style={{ textAnchor } as React.CSSProperties}
                  fontSize="8"
                  fill="rgba(45,42,38,0.4)"
                  fontFamily="'Helvetica Neue', Arial, sans-serif"
                  letterSpacing="0.08em"
                  className="transition-all duration-300"
                >
                  {getDescriptor(d.label, d.value)}
                </text>

                {/* Point A Draggable dots & tooltips */}
                {!hasB && (
                  <>
                    <circle
                      cx={getCoordinates(i, d.value, scaleProgress).x}
                      cy={getCoordinates(i, d.value, scaleProgress).y}
                      r={interactive ? 7 : 4}
                      fill={interactive ? "#ffffff" : colorA}
                      stroke={colorA}
                      strokeWidth={interactive ? 2 : 1}
                      className={`${
                        interactive ? "cursor-ns-resize hover:r-9 active:scale-110 active:fill-amber-50" : "pointer-events-none"
                      } transition-all duration-200`}
                      onMouseDown={(e) => handlePointDrag(e, i)}
                      onTouchStart={(e) => handlePointDrag(e, i)}
                    />
                    {!interactive && d.value > 5 && (
                      <text
                        cx={getCoordinates(i, d.value, scaleProgress).x}
                        cy={getCoordinates(i, d.value, scaleProgress).y}
                        x={getCoordinates(i, d.value, scaleProgress).x}
                        y={getCoordinates(i, d.value, scaleProgress).y - 6}
                        textAnchor="middle"
                        fontSize="7"
                        fill="rgba(45,42,38,0.6)"
                        fontFamily="'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
                        className="pointer-events-none"
                      >
                        {d.value}
                      </text>
                    )}
                  </>
                )}

                {/* Double comparison circles in compare mode */}
                {hasB && (
                  <>
                    {/* Circle A */}
                    <circle
                      cx={getCoordinates(i, d.value, scaleProgress).x}
                      cy={getCoordinates(i, d.value, scaleProgress).y}
                      r="3"
                      fill={colorA}
                    />
                    {/* Circle B */}
                    <circle
                      cx={getCoordinates(i, d.valueB || 0, scaleProgress).x}
                      cy={getCoordinates(i, d.valueB || 0, scaleProgress).y}
                      r="3"
                      fill={colorB}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic center ink logo */}
        <div className="absolute w-4 h-4 rounded-full border border-[#2d2a26]/10 bg-white shadow-xs pointer-events-none flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2d2a26]/40 animate-pulse" />
        </div>
      </div>

      {/* Legend for Compare Mode (B) */}
      {hasB && (
        <div className="flex gap-6 items-center justify-center mt-3 text-xs tracking-wider font-light">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorA }}
            />
            <span className="font-serif text-[#2d2a26]">{nameA}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorB }}
            />
            <span className="font-serif text-[#2d2a26]">{nameB}</span>
          </div>
        </div>
      )}
    </div>
  );
}
