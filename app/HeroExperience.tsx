"use client";

import { useEffect, useState, type KeyboardEvent } from "react";

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
  const [isOrbiting, setIsOrbiting] = useState(false);

  useEffect(() => {
    const handleTierChange = (event: Event) => {
      const nextTier = (event as CustomEvent<{ tier: string }>).detail.tier;
      if (nextTier !== "full") setIsOrbiting(false);
    };

    window.addEventListener("scene:tierchange", handleTierChange);
    return () => window.removeEventListener("scene:tierchange", handleTierChange);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const controls: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -0.75, y: 0 },
      ArrowRight: { x: 0.75, y: 0 },
      ArrowUp: { x: 0, y: -0.75 },
      ArrowDown: { x: 0, y: 0.75 },
      Escape: { x: 0, y: 0 },
    };
    const next = controls[event.key];

    if (!next) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new CustomEvent("scene:nudge", { detail: next }));
  }

  return (
    <section
      className={`hero3d${isOrbiting ? " hero3d--orbiting" : ""}`}
      id="top"
      data-scene="hero"
      data-scene-hotspot
      aria-labelledby="hero-title"
      aria-describedby="hero-interaction-hint"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="hero3dViewport" aria-hidden="true">
        <div className="hero3dWorld">
          <div className="hero3dBackdrop">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/images/3d/hero-backdrop-mobile.webp"
                type="image/webp"
              />
              <source srcSet="/images/3d/hero-backdrop.webp" type="image/webp" />
              <img
                src="/images/ju-birthday-2021.jpg"
                alt=""
                width={1800}
                height={1350}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
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
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/images/3d/hero-character-mobile.webp"
                type="image/webp"
              />
              <source srcSet="/images/3d/hero-character.webp" type="image/webp" />
              <img
                className="hero3dCharacter"
                src="/images/3d/hero-character.png"
                alt=""
                width={1023}
                height={1537}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
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
            onClick={() =>
              setIsOrbiting((value) => {
                const next = !value;
                window.dispatchEvent(
                  new CustomEvent("scene:orbit", { detail: { enabled: next } }),
                );
                return next;
              })
            }
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
