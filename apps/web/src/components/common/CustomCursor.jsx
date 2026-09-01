import React, { useEffect, useState, useRef } from "react";

/**
 * Cyber Kinetic Comet Cursor
 * Electric Blue & Cyan comet ribbon trail with organic fluid physics,
 * spotlight aura hover snap, and zero top-left rendering bug.
 */
export function CustomCursor() {
  const [pos, setPos] = useState(null);
  const [trailPos1, setTrailPos1] = useState(null);
  const [trailPos2, setTrailPos2] = useState(null);
  const [trailPos3, setTrailPos3] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const posRef = useRef(null);
  const trail1Ref = useRef(null);
  const trail2Ref = useRef(null);
  const trail3Ref = useRef(null);
  const requestRef = useRef();

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      if (!posRef.current) {
        posRef.current = { x, y };
        trail1Ref.current = { x, y };
        trail2Ref.current = { x, y };
        trail3Ref.current = { x, y };
        setPos({ x, y });
        setTrailPos1({ x, y });
        setTrailPos2({ x, y });
        setTrailPos3({ x, y });
        setIsVisible(true);
        return;
      }

      posRef.current = { x, y };
      setPos({ x, y });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const interactiveEl = target?.closest
        ? target.closest("button, a, input, select, textarea, .product-card, .step-item, .preset-chip, [role='button'], .v2-gallery-thumb")
        : null;

      setIsHovered(!!interactiveEl);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Multi-stage fluid comet ribbon inertia
    const animate = () => {
      if (posRef.current && trail1Ref.current) {
        // Stage 1
        trail1Ref.current.x += (posRef.current.x - trail1Ref.current.x) * 0.38;
        trail1Ref.current.y += (posRef.current.y - trail1Ref.current.y) * 0.38;
        setTrailPos1({ x: trail1Ref.current.x, y: trail1Ref.current.y });

        // Stage 2
        trail2Ref.current.x += (trail1Ref.current.x - trail2Ref.current.x) * 0.28;
        trail2Ref.current.y += (trail1Ref.current.y - trail2Ref.current.y) * 0.28;
        setTrailPos2({ x: trail2Ref.current.x, y: trail2Ref.current.y });

        // Stage 3
        trail3Ref.current.x += (trail2Ref.current.x - trail3Ref.current.x) * 0.20;
        trail3Ref.current.y += (trail2Ref.current.y - trail3Ref.current.y) * 0.20;
        setTrailPos3({ x: trail3Ref.current.x, y: trail3Ref.current.y });
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  if (!pos || !trailPos1 || !trailPos2 || !trailPos3 || !isVisible) return null;

  return (
    <div className="comet-cursor-layer">
      {/* Comet Tail Stage 3 (Magenta/Purple Soft Fade) */}
      <div
        className="comet-tail-3"
        style={{
          transform: `translate3d(${trailPos3.x}px, ${trailPos3.y}px, 0) translate(-50%, -50%)`,
        }}
      />

      {/* Comet Tail Stage 2 (Cyan Fluid Glow) */}
      <div
        className="comet-tail-2"
        style={{
          transform: `translate3d(${trailPos2.x}px, ${trailPos2.y}px, 0) translate(-50%, -50%)`,
        }}
      />

      {/* Comet Tail Stage 1 (Electric Blue Follower) */}
      <div
        className={`comet-tail-1 ${isHovered ? "is-hovered" : ""} ${isClicked ? "is-clicked" : ""}`}
        style={{
          transform: `translate3d(${trailPos1.x}px, ${trailPos1.y}px, 0) translate(-50%, -50%)`,
        }}
      />

      {/* Comet Head Laser Dot */}
      <div
        className={`comet-head ${isHovered ? "is-hovered" : ""} ${isClicked ? "is-clicked" : ""}`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        }}
      />
    </div>
  );
}
