"use client";

import { useEffect, useRef, useState } from "react";

const navigation = [
  ["works", "代表作"],
  ["journey", "经历"],
  ["gallery", "影像"],
  ["about", "关于"],
] as const;

export default function SiteHeader() {
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateProgress);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-24% 0px -62% 0px", threshold: [0, 0.1, 0.5] },
    );

    navigation.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
    setMenuOpen(false);
  };

  const renderLinks = () =>
    navigation.map(([id, label]) => (
      <a
        href={`#${id}`}
        key={id}
        aria-current={activeSection === id ? "location" : undefined}
        onClick={closeMenu}
      >
        {label}
      </a>
    ));

  return (
    <header className="siteHeader">
      <a className="wordmark" href="#top" aria-label="返回页面顶部" onClick={closeMenu}>
        <span>JU</span> JINGYI
      </a>
      <nav className="desktopNav" aria-label="主要导航">
        {renderLinks()}
      </nav>
      <details
        className="mobileNav"
        ref={menuRef}
        onToggle={(event) => setMenuOpen(event.currentTarget.open)}
      >
        <summary aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}>
          <span />
          <span />
        </summary>
        <nav aria-label="移动端导航">{renderLinks()}</nav>
      </details>
      <span className="readingProgressTrack" aria-hidden="true">
        <span
          className="readingProgress"
          style={{ transform: `scaleX(${readingProgress})` }}
        />
      </span>
    </header>
  );
}
