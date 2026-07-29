"use client";

import { useMemo, useState } from "react";

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
  const visibleWorks = useMemo(
    () =>
      works.filter((work) => {
        if (filter === "all") return true;
        if (filter === "music") return work.kind === "音乐单曲";
        return work.kind === "电视剧";
      }),
    [filter, works],
  );

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
            <a
              className={`workArt${work.imageFit === "contain" ? " workArt--contain" : ""}`}
              href={work.source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在 ${work.platform} 新窗口打开《${work.title}》作品页面`}
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
                打开作品 ↗
              </span>
            </a>
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
    </>
  );
}
