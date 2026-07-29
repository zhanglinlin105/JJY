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
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const handleChapterChange = (event: Event) => {
      const chapter = (event as CustomEvent<{ chapter: string }>).detail.chapter;
      setActiveSection(chapter);
    };

    window.addEventListener("scene:chapterchange", handleChapterChange);
    return () => window.removeEventListener("scene:chapterchange", handleChapterChange);
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
        <span className="readingProgress" />
      </span>
    </header>
  );
}
