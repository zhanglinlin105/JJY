"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const particles = [
  ["10%", "20%", "-10px", "3px"],
  ["17%", "70%", "90px", "5px"],
  ["35%", "13%", "40px", "2px"],
  ["45%", "84%", "150px", "4px"],
  ["61%", "17%", "130px", "3px"],
  ["73%", "73%", "210px", "6px"],
  ["87%", "29%", "80px", "3px"],
  ["92%", "61%", "180px", "2px"],
] as const;

export default function HeroExperience() {
  const heroRef = useRef<HTMLElement>(null);
  const animationFrame = useRef<number | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);

  useEffect(() => {
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  function updateView(x: number, y: number) {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      hero.style.setProperty("--scene-rx", `${(-y * 5.5).toFixed(2)}deg`);
      hero.style.setProperty("--scene-ry", `${(x * 8).toFixed(2)}deg`);
      hero.style.setProperty("--scene-x", `${(x * 18).toFixed(2)}px`);
      hero.style.setProperty("--scene-y", `${(y * 12).toFixed(2)}px`);
      hero.style.setProperty("--light-x", `${(50 + x * 18).toFixed(2)}%`);
      hero.style.setProperty("--light-y", `${(42 + y * 14).toFixed(2)}%`);
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    updateView(x, y);
    setIsEngaged(true);
  }

  function resetView() {
    updateView(0, 0);
    setIsEngaged(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const controls: Record<string, [number, number]> = {
      ArrowLeft: [-0.75, 0],
      ArrowRight: [0.75, 0],
      ArrowUp: [0, -0.75],
      ArrowDown: [0, 0.75],
      Escape: [0, 0],
    };
    const next = controls[event.key];

    if (!next) {
      return;
    }

    event.preventDefault();
    updateView(...next);
    setIsEngaged(event.key !== "Escape");
  }

  return (
    <section
      className={`hero3d${isOrbiting ? " hero3d--orbiting" : ""}${
        isEngaged ? " hero3d--engaged" : ""
      }`}
      id="top"
      aria-labelledby="hero-title"
      aria-describedby="hero-interaction-hint"
      ref={heroRef}
      tabIndex={0}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetView}
      onBlur={resetView}
      onKeyDown={handleKeyDown}
    >
      <div className="hero3dViewport" aria-hidden="true">
        <div className="hero3dWorld">
          <div className="hero3dBackdrop">
            <img
              src="/images/ju-birthday-2021.jpg"
              alt=""
              width={1800}
              height={1350}
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="hero3dGrid" />
          <div className="hero3dGlow" />
          <div className="hero3dMonogram">婧</div>
          <div className="hero3dOrbit hero3dOrbit--one" />
          <div className="hero3dOrbit hero3dOrbit--two" />
          <div className="hero3dGlass">
            <span>03</span>
            <p>PORTRAIT<br />IN MOTION</p>
            <i />
          </div>
          <div className="hero3dPedestal" />
          <div className="hero3dCharacterStage">
            <img
              className="hero3dCharacter"
              src="/images/3d/hero-character.png"
              alt=""
              width={1023}
              height={1537}
              decoding="async"
            />
          </div>
          {particles.map(([left, top, depth, size], index) => (
            <i
              className="hero3dParticle"
              key={`${left}-${top}`}
              style={{
                left,
                top,
                width: size,
                height: size,
                transform: `translateZ(${depth})`,
                animationDelay: `${index * -0.7}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="hero3dContent">
        <p className="eyebrow hero3dEyebrow">ACTRESS · SINGER / 1994—PRESENT</p>
        <h1 id="hero-title">
          <span>鞠</span>
          <span>婧祎</span>
        </h1>
        <p className="hero3dIntro">
          从剧场舞台到荧幕叙事，
          <br />
          在表演与音乐之间，持续书写自己的章节。
        </p>
        <div className="heroActions">
          <a className="primaryButton" href="#works">
            进入她的世界 <span aria-hidden="true">↘</span>
          </a>
          <button
            className="orbitToggle"
            type="button"
            aria-pressed={isOrbiting}
            onClick={() => setIsOrbiting((value) => !value)}
          >
            <span aria-hidden="true">{isOrbiting ? "Ⅱ" : "◌"}</span>
            {isOrbiting ? "暂停环绕" : "自动环绕"}
          </button>
        </div>
      </div>

      <div className="hero3dMeta">
        <p id="hero-interaction-hint">
          <span aria-hidden="true">↔</span> 移动视角 · 方向键微调
        </p>
        <p>PHOTO / CAMELLIA234 · GENERATED DEPTH STUDY</p>
      </div>

      <div className="hero3dDepth" aria-hidden="true">
        <span>DEPTH</span>
        <i />
        <b>180°</b>
      </div>
    </section>
  );
}
