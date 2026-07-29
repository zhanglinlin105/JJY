"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

type Work = {
  year: string;
  kind: string;
  title: string;
  role: string;
  note: string;
  source: string;
  image: string;
  imageFit?: string;
  platform: string;
  width: number;
  height: number;
};

type Filter = "all" | "drama" | "music";

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "drama", label: "电视剧" },
  { value: "music", label: "音乐" },
];

export default function WorksShowcase({ works }: { works: Work[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const visibleWorks = useMemo(
    () =>
      works.filter((work) => {
        if (filter === "all") return true;
        if (filter === "music") return work.kind === "音乐单曲";
        return work.kind === "电视剧";
      }),
    [filter, works],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedWork && !dialog.open) {
      dialog.showModal();
      window.dispatchEvent(
        new CustomEvent("scene:detail", { detail: { open: true } }),
      );
    }
  }, [selectedWork]);

  const closeDetail = () => dialogRef.current?.close();

  const handleClosed = () => {
    const title = selectedWork?.title;
    setSelectedWork(null);
    window.dispatchEvent(
      new CustomEvent("scene:detail", { detail: { open: false } }),
    );
    if (title) triggerRefs.current.get(title)?.focus();
  };

  const moveSelection = (direction: -1 | 1) => {
    if (!selectedWork) return;
    const index = visibleWorks.findIndex((work) => work.title === selectedWork.title);
    const next = (index + direction + visibleWorks.length) % visibleWorks.length;
    setSelectedWork(visibleWorks[next]);
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") moveSelection(-1);
    if (event.key === "ArrowRight") moveSelection(1);
  };

  return (
    <>
      <div className="worksToolbar">
        <div className="workFilters" aria-label="筛选代表作">
          {filters.map((item) => (
            <button
              type="button"
              key={item.value}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p aria-live="polite">
          显示 {visibleWorks.length} / {works.length} 部作品
        </p>
      </div>

      <div className="worksList">
        {visibleWorks.map((work, index) => (
          <article className="workCard" key={work.title}>
            <button
              type="button"
              className={`workArt${work.imageFit === "contain" ? " workArt--contain" : ""}`}
              aria-label={`查看《${work.title}》作品详情`}
              data-scene-hotspot
              ref={(element) => {
                if (element) triggerRefs.current.set(work.title, element);
                else triggerRefs.current.delete(work.title);
              }}
              onClick={() => setSelectedWork(work)}
            >
              <img
                className="workCover"
                src={work.image}
                alt={`《${work.title}》作品封面`}
                width={work.width}
                height={work.height}
                loading="lazy"
                decoding="async"
              />
              <span className="workNumber" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="workPlatform" aria-hidden="true">
                {work.platform}
              </span>
              <span className="workOpen" aria-hidden="true">
                查看详情 →
              </span>
            </button>
            <div className="workInfo">
              <p className="workMeta">
                {work.year} <span /> {work.kind}
              </p>
              <h3>{work.title}</h3>
              <p className="workRole">
                {work.kind === "音乐单曲" ? work.role : `饰 / ${work.role}`}
              </p>
              <p className="workNote">{work.note}</p>
              <a
                href={work.source}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`在 ${work.platform} 新窗口打开《${work.title}》`}
              >
                在 {work.platform} 打开 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <dialog
        className="detailDialog workDialog"
        ref={dialogRef}
        onClose={handleClosed}
        onKeyDown={handleDialogKeyDown}
        aria-labelledby="work-dialog-title"
      >
        {selectedWork ? (
          <div className="detailDialogPanel">
            <button
              className="detailClose"
              type="button"
              onClick={closeDetail}
              aria-label="关闭作品详情"
            >
              关闭 ×
            </button>
            <div className="detailArtwork">
              <img
                src={selectedWork.image}
                alt={`《${selectedWork.title}》作品封面`}
                width={selectedWork.width}
                height={selectedWork.height}
              />
            </div>
            <div className="detailCopy">
              <p className="eyebrow">
                {selectedWork.year} / {selectedWork.kind}
              </p>
              <h3 id="work-dialog-title">{selectedWork.title}</h3>
              <p className="detailRole">
                {selectedWork.kind === "音乐单曲"
                  ? selectedWork.role
                  : `饰 / ${selectedWork.role}`}
              </p>
              <p>{selectedWork.note}</p>
              <a
                className="detailExternal"
                href={selectedWork.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                前往 {selectedWork.platform} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="detailPager" aria-label="切换作品">
              <button type="button" onClick={() => moveSelection(-1)}>
                ← 上一部
              </button>
              <span>
                {String(
                  visibleWorks.findIndex((work) => work.title === selectedWork.title) + 1,
                ).padStart(2, "0")}
                /{String(visibleWorks.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => moveSelection(1)}>
                下一部 →
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
