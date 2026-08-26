import { useState, useRef } from "react";

interface CubeData {
  id: number;
  x: number; // in px
  y: number; // in px
  z: number; // in px
  size: number; // in px
  delay: string;
}

const CUBES: CubeData[] = [
  // Central dense cluster
  { id: 1, x: 0,    y: 0,   z: 0,   size: 76, delay: "0s" },
  { id: 2, x: 55,   y: -45, z: 40,  size: 62, delay: "0.4s" },
  { id: 3, x: -50,  y: 40,  z: -30, size: 58, delay: "0.8s" },
  { id: 4, x: 60,   y: 45,  z: -20, size: 52, delay: "1.2s" },
  { id: 5, x: -55,  y: -40, z: 45,  size: 48, delay: "0.6s" },
  // Satellite floating nodes
  { id: 6, x: 110,  y: -15, z: 10,  size: 38, delay: "1.5s" },
  { id: 7, x: -105, y: 15,  z: 20,  size: 34, delay: "1.8s" },
  { id: 8, x: 15,   y: -95, z: -15, size: 32, delay: "2.1s" },
  { id: 9, x: -20,  y: 90,  z: 25,  size: 36, delay: "1.0s" },
];

function IsometricCube({ cube }: { cube: CubeData }) {
  const s = cube.size;
  const half = s / 2;

  // Sage & Vanilla face palette — flat solid tones, directional shading
  return (
    <div
      className="absolute transition-transform duration-700 ease-out"
      style={{
        width: `${s}px`,
        height: `${s}px`,
        transform: `translate3d(${cube.x}px, ${cube.y}px, ${cube.z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Front Face — primary sage */}
      <div
        className="absolute inset-0 border border-[#F0E9D3]/30"
        style={{
          backgroundColor: "#5B7544",
          transform: `translateZ(${half}px)`,
        }}
      />
      {/* Back Face — deep forest */}
      <div
        className="absolute inset-0 border border-[#F0E9D3]/15"
        style={{
          backgroundColor: "#1E2A14",
          transform: `rotateY(180deg) translateZ(${half}px)`,
        }}
      />
      {/* Right Face — mid sage */}
      <div
        className="absolute inset-0 border border-[#F0E9D3]/20"
        style={{
          backgroundColor: "#4A6037",
          transform: `rotateY(90deg) translateZ(${half}px)`,
        }}
      />
      {/* Left Face — dark sage */}
      <div
        className="absolute inset-0 border border-[#F0E9D3]/15"
        style={{
          backgroundColor: "#567C8D",
          transform: `rotateY(-90deg) translateZ(${half}px)`,
        }}
      />
      {/* Top Face — illuminated warm vanilla */}
      <div
        className="absolute inset-0 border border-[#F0E9D3]/40"
        style={{
          backgroundColor: "#88A170",
          transform: `rotateX(90deg) translateZ(${half}px)`,
        }}
      />
      {/* Bottom Face — deepest canvas */}
      <div
        className="absolute inset-0 border border-[#F0E9D3]/10"
        style={{
          backgroundColor: "#25311B",
          transform: `rotateX(-90deg) translateZ(${half}px)`,
        }}
      />
    </div>
  );
}

export default function IsometricCluster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setMouse({ x: normX, y: normY });
  };

  const handleMouseLeave = () => {
    setMouse({ x: 0, y: 0 });
  };

  const tiltX = mouse.y * -14;
  const tiltY = mouse.x * 16;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center select-none"
      style={{ perspective: "1200px" }}
    >
      {/* 3D Isometric Viewport Container */}
      <div
        className="relative size-full flex items-center justify-center animate-float-bob"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${26 + tiltX}deg) rotateY(${-28 + tiltY}deg) rotateZ(0deg)`,
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {CUBES.map((cube) => (
          <IsometricCube key={cube.id} cube={cube} />
        ))}
      </div>
    </div>
  );
}
