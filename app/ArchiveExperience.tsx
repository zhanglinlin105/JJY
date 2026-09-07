"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { gallery, sources, timeline, works } from "./archive-data";
import { chapters, chapterIndex, matchesFilter, type ChapterId, type Selection, type WorkFilter } from "./scene-layout";
import type { ArchiveSceneAPI } from "./create-archive-scene";

type Status = "loading" | "ready" | "unsupported" | "lost";

function Glyph({ name }: { name: "orbit" | "reset" | "arrow" | "book" | "close" | "expand" }) {
  const paths = {
    orbit: <><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)" /><circle cx="12" cy="12" r="4" /></>,
    reset: <><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></>,
    arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
    book: <><path d="M12 5v15M12 6C8 3 4 4 2 5v14c4-2 7-1 10 1 3-2 6-3 10-1V5c-4-2-7-1-10 1Z" /></>,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    expand: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function ArchiveExperience({ archive }: { archive: ReactNode }) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const scene = useRef<ArchiveSceneAPI | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const detailClose = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const [chapter, setChapter] = useState<ChapterId>("top");
  const [filter, setFilter] = useState<WorkFilter>("all");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [reading, setReading] = useState(false);
  const [retry, setRetry] = useState(0);
  const [assetErrors, setAssetErrors] = useState(false);
  const stateRef = useRef({ chapter, filter });
  const active = chapters[chapterIndex(chapter)];

  const select = useCallback((value: Selection) => {
    lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelection(value);
    scene.current?.focus(value);
  }, []);

  const navigate = useCallback((next: ChapterId, updateHistory = true) => {
    setChapter(next);
    stateRef.current.chapter = next;
    setSelection(null);
    setHovered(null);
    scene.current?.navigate(next);
    if (updateHistory) window.history.pushState(null, "", `#${next}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const host = canvasHost.current!;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => {
      setReducedMotion(media.matches);
      if (media.matches) setRotating(false);
      scene.current?.setReducedMotion(media.matches);
    };
    motionChange();
    media.addEventListener("change", motionChange);
    import("./create-archive-scene").then(({ createArchiveScene }) => {
      if (cancelled) return;
      try {
        scene.current = createArchiveScene(host, {
          reducedMotion: media.matches,
          onReady: () => { if (!cancelled) setStatus("ready"); },
          onProgress: (value) => { if (!cancelled) setProgress(value); },
          onAssetError: () => { if (!cancelled) setAssetErrors(true); },
          onSelect: select,
          onHover: setHovered,
          onContextLost: () => { if (!cancelled) setStatus("lost"); },
        });
        scene.current.navigate(stateRef.current.chapter, true);
        scene.current.setFilter(stateRef.current.filter);
      } catch (error) {
        console.error("Unable to start the archive scene", error);
        if (!cancelled) setStatus("unsupported");
      }
    }).catch(() => { if (!cancelled) setStatus("unsupported"); });
    return () => {
      cancelled = true;
      media.removeEventListener("change", motionChange);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [retry, select]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      const destination = chapters.find(item => item.id === hash);
      if (destination) navigate(destination.id, false);
      else if (!hash) navigate("top", false);
    };
    onHashChange();
    window.addEventListener("popstate", onHashChange);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("popstate", onHashChange);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [navigate]);

  useEffect(() => {
    scene.current?.setAutoRotate(rotating);
  }, [rotating, status]);

  useEffect(() => {
    scene.current?.setPaused(reading);
  }, [reading, status]);

  useEffect(() => {
    if (selection) detailClose.current?.focus({ preventScroll: true });
  }, [selection]);

  const closeDetail = useCallback(() => {
    setSelection(null);
    scene.current?.navigate(stateRef.current.chapter);
    lastTrigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (reading || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Escape" && selection) closeDetail();
      if (event.target instanceof Element && event.target.closest("button, a, input, dialog")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const delta = event.key === "ArrowRight" ? 1 : -1;
        navigate(chapters[(chapterIndex(chapter) + delta + chapters.length) % chapters.length].id);
      }
      if (event.key === "r" || event.key === "R") scene.current?.navigate(chapter);
      if (event.key === "+" || event.key === "=") scene.current?.zoom(0.86);
      if (event.key === "-") scene.current?.zoom(1.16);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, closeDetail, navigate, reading, selection]);

  function openArchive() {
    dialog.current?.showModal();
    setReading(true);
  }

  function changeFilter(next: WorkFilter) {
    setFilter(next);
    stateRef.current.filter = next;
    setSelection(null);
    scene.current?.setFilter(next);
    scene.current?.navigate("works");
  }

  const visibleWorks = works.map((work, index) => ({ ...work, index })).filter(work => matchesFilter(work.kind, filter));
  const selectedWork = selection?.chapter === "works" ? works[selection.index] : null;
  const selectedMoment = selection?.chapter === "journey" ? timeline[selection.index] : null;
  const selectedPhoto = selection?.chapter === "gallery" ? gallery[selection.index] : null;

  return (
    <div className="experience" data-chapter={chapter}>
      <a className="skipLink" href="#exhibit-index" onClick={event => { event.preventDefault(); document.getElementById("exhibit-index")?.focus(); }}>跳到展品目录</a>
      <div className="sceneHost" ref={canvasHost} role="region" aria-label="三维光影档案馆，拖动旋转视角，滚轮缩放。方向键切换展区，加减键缩放，R 重置。" tabIndex={0} />
      <div className="sceneVignette" aria-hidden="true" />

      <header className="experienceHeader">
        <a className="wordmark" href="#top" onClick={event => { event.preventDefault(); navigate("top"); }} aria-label="鞠婧祎，返回序厅"><span className="brandIcon">J<span>J</span></span><span>JU JINGYI<small>THE PORTRAIT ARCHIVE</small></span></a>
        <nav className="chapterNav" aria-label="展区导航">{chapters.map((item, index) => <a href={`#${item.id}`} key={item.id} aria-current={chapter === item.id ? "page" : undefined} onClick={event => { event.preventDefault(); navigate(item.id); }}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>)}</nav>
        <button className="readButton" onClick={openArchive}><Glyph name="book" /><span>阅读档案</span></button>
      </header>

      <main className={`exhibitionOverlay${selection ? " hasSelection" : ""}`}>
        <section className="chapterIntroduction" aria-labelledby="chapter-title">
          <p className="eyebrow"><span className="liveDot" />{active.en}<span className="chapterEdition"> / 0{chapterIndex(chapter) + 1}</span></p>
          <h1 id="chapter-title" key={chapter}>{active.title}</h1>
          {chapter === "top" && <p className="romanName">JU JINGYI</p>}
          <p className="chapterCopy">{active.subtitle}</p>
          {chapter === "top" && <><p className="identityLine">演员 <i /> 歌手 <i /> 1994—PRESENT</p><button className="enterButton" onClick={() => navigate("works")}>进入她的世界<Glyph name="arrow" /></button></>}
          {chapter === "works" && <div className="sceneFilters" aria-label="筛选代表作">{([ ["all", "全部"], ["drama", "电视剧"], ["music", "音乐"] ] as const).map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => changeFilter(value)}>{label}</button>)}<span aria-live="polite">{visibleWorks.length} 部</span></div>}
          {chapter === "about" && <div className="aboutSceneCopy"><p>从群像里的一个位置，到拥有自己的姓名与表达，鞠婧祎的职业轨迹是一场缓慢而坚定的自我建立。</p><p>她在荧幕中保存人物的情绪，也在音乐里留下自己的声音。</p><button className="textButton" onClick={openArchive}>人物资料与影像来源 ↗</button></div>}
        </section>

        {chapter === "top" && <div className="sceneAnnotation"><span>FIG. 01 — A PORTRAIT IN MOTION</span><span>她的故事，始于一方剧场。</span></div>}

        <aside className="sceneTools" aria-label="视角控制">
          <button title={rotating ? "暂停环绕" : "自动环绕"} aria-label={rotating ? "暂停环绕" : "自动环绕"} aria-pressed={rotating} disabled={reducedMotion} onClick={() => setRotating(value => !value)}><Glyph name="orbit" /></button>
          <button title="重置视角 (R)" aria-label="重置视角" onClick={() => { setSelection(null); scene.current?.navigate(chapter); }}><Glyph name="reset" /></button>
          <span className="toolDivider" />
          <button title="放大 (+)" aria-label="放大" onClick={() => scene.current?.zoom(0.86)}>+</button>
          <button title="缩小 (-)" aria-label="缩小" onClick={() => scene.current?.zoom(1.16)}>−</button>
        </aside>

        {selection && <aside className="exhibitDetail" aria-labelledby="detail-title" onKeyDown={event => { if (event.key === "Escape") closeDetail(); }}>
          <button className="detailClose" ref={detailClose} onClick={closeDetail} aria-label="关闭详情"><Glyph name="close" /></button>
          {selectedWork && <><img src={selectedWork.image} alt={`《${selectedWork.title}》作品封面`} /><div className="detailBody"><p className="eyebrow">{selectedWork.year} / {selectedWork.kind}</p><h2 id="detail-title">{selectedWork.title}</h2><p className="detailRole">{selectedWork.kind === "音乐单曲" ? "演唱" : `饰 / ${selectedWork.role}`}</p><p>{selectedWork.note}</p><a className="detailLink" href={selectedWork.source} target="_blank" rel="noopener noreferrer">在 {selectedWork.platform} 打开作品 ↗</a></div></>}
          {selectedMoment && <div className="detailBody"><p className="momentYear">{selectedMoment.year}</p><h2 id="detail-title">{selectedMoment.title}</h2><p>{selectedMoment.text}</p></div>}
          {selectedPhoto && <><img className="detailPortrait" src={selectedPhoto.src} alt={selectedPhoto.alt} /><div className="detailBody"><p className="eyebrow">PORTRAITS & MOMENTS</p><h2 id="detail-title">{selectedPhoto.caption}</h2><p>{selectedPhoto.alt}</p><a className="detailLink" href={selectedPhoto.file} target="_blank" rel="noopener noreferrer">查看原始影像与授权 ↗</a></div></>}
          {(selection.chapter === "top" || selection.chapter === "about") && <div className="detailBody"><p className="eyebrow">A PORTRAIT IN MOTION</p><h2 id="detail-title">她的故事</h2><p>鞠婧祎，1994 年 6 月 18 日出生于四川遂宁，中国内地演员、歌手。2013 年正式出道，职业路径横跨偶像舞台、流行音乐与古装影视。她以克制而清晰的个人风格，完成从团体成员到个人艺人的转身。</p><button className="textButton" onClick={openArchive}>阅读完整人物档案 ↗</button></div>}
        </aside>}

        <section className="exhibitIndex" id="exhibit-index" tabIndex={-1} aria-label="展品目录">
          {chapter === "works" && visibleWorks.map(work => <button key={work.title} aria-pressed={selection?.index === work.index && selection.chapter === "works"} onClick={() => select({ chapter, index: work.index })}><small>{work.year}</small>{work.title}<span>↗</span></button>)}
          {chapter === "journey" && timeline.map((moment, index) => <button key={moment.title} aria-pressed={selection?.index === index && selection.chapter === "journey"} onClick={() => select({ chapter, index })}><small>{moment.year}</small>{moment.title}<span>↗</span></button>)}
          {chapter === "gallery" && gallery.map((photo, index) => <button key={photo.src} aria-pressed={selection?.index === index && selection.chapter === "gallery"} onClick={() => select({ chapter, index })}><small>0{index + 1}</small>{photo.caption}<span>↗</span></button>)}
        </section>
      </main>

      {status === "loading" && <div className="sceneLoading" role="status"><span className="loadingOrbit" /><p>正在点亮展馆</p><span className="loadingTrack"><i style={{ width: `${Math.max(progress, 8)}%` }} /></span><small>影像正在抵达 · {progress}%</small></div>}
      {(status === "unsupported" || status === "lost") && <div className="sceneFailure" role="alert"><Glyph name="orbit" /><h2>{status === "lost" ? "三维场景暂时中断" : "当前设备无法开启三维展馆"}</h2><p>人物、作品与影像仍可在完整档案中阅读。</p><div><button className="enterButton" onClick={openArchive}>阅读完整档案<Glyph name="book" /></button><button className="textButton" onClick={() => { setStatus("loading"); setProgress(0); setRetry(value => value + 1); }}>重新加载展馆</button></div></div>}

      <footer className="experienceFooter">
        <div className="interactionHint"><Glyph name="orbit" /><p>{hovered ? <><b>{hovered}</b><span>点击展品 · 查看详情</span></> : <><b>拖动环绕 <i /> 滚轮缩放</b><span>触屏拖动 · 双指缩放 · ← → 切换展区</span></>}</p></div>
        <div className="chapterProgress" aria-label={`当前展区 ${chapterIndex(chapter) + 1} / 5`}><b>0{chapterIndex(chapter) + 1}</b><span>{chapters.map(item => <i key={item.id} className={item.id === chapter ? "active" : ""} />)}</span><small>05</small></div>
        <div className="nextChapter"><button onClick={() => navigate(chapters[(chapterIndex(chapter) + 1) % chapters.length].id)}>{chapter === "about" ? "回到序厅" : `下一站 · ${chapters[(chapterIndex(chapter) + 1) % chapters.length].label}`}<Glyph name="arrow" /></button><small>{assetErrors ? "部分影像未载入，可在阅读档案中查看" : "非官方人物志 · 影像与资料来源见档案"}</small></div>
      </footer>

      <dialog className="archiveDialog" ref={dialog} onClose={() => setReading(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="archiveDialogHeader"><span>JU JINGYI / 完整档案</span><button autoFocus onClick={() => dialog.current?.close()} aria-label="关闭档案，返回三维展馆"><Glyph name="close" /></button></div>
        <div className="readingArchive">{archive}</div>
      </dialog>
      <noscript><style>{`.experienceHeader,.exhibitionOverlay,.experienceFooter,.sceneLoading,.sceneHost,.sceneVignette{display:none!important}.archiveDialog{display:block!important;position:relative!important;max-height:none!important;height:auto!important;width:100%!important;margin:0!important;border:0!important}.archiveDialogHeader{display:none!important}.experience{height:auto!important;overflow:visible!important}body{overflow:auto!important}`}</style></noscript>
      <div className="srOnly" aria-live="polite">当前展区：{active.label}。{selection ? "已打开展品详情。" : ""}</div>
      <div className="srOnly">人物资料来源：{sources.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</div>
    </div>
  );
}
