export const chapters = [
  { id: "top", label: "序厅", en: "THE PORTRAIT", title: "鞠婧祎", subtitle: "从剧场舞台到荧幕叙事，\n在表演与音乐之间，持续书写自己的章节。" },
  { id: "works", label: "代表作", en: "SELECTED WORKS", title: "银幕与舞台", subtitle: "七部作品，串联演员与歌手两种身份。\n走近一部作品，读懂一个角色。" },
  { id: "journey", label: "经历", en: "CAREER JOURNEY", title: "时间留下的光", subtitle: "十余年的职业轨迹。\n每一次选择，都成为下一束光的起点。" },
  { id: "gallery", label: "影像", en: "PORTRAITS & MOMENTS", title: "光影切片", subtitle: "舞台、镜头与安静片刻，\n构成人物更完整的侧面。" },
  { id: "about", label: "关于", en: "BEYOND THE FRAME", title: "角色之外", subtitle: "仍然是创作者。\n演员、歌手与舞者，都是她表达自己的方式。" },
] as const;

export type ChapterId = typeof chapters[number]["id"];
export type WorkFilter = "all" | "drama" | "music";
export type Selection = { chapter: ChapterId; index: number };
export const ROOM_SPACING = 48;
export function chapterIndex(id: string) {
  return Math.max(0, chapters.findIndex((chapter) => chapter.id === id));
}
export function roomCenter(id: ChapterId): [number, number, number] {
  return [chapterIndex(id) * ROOM_SPACING, 0, 0];
}
export function exhibitPosition(index: number, count: number, radius = 7): [number, number, number] {
  const angle = count === 1 ? 0 : (index / (count - 1) - 0.5) * 2.3;
  return [Math.sin(angle) * radius, 0, -Math.cos(angle) * radius + 3];
}
export function matchesFilter(kind: string, filter: WorkFilter) {
  return filter === "all" || (filter === "music" ? kind === "音乐单曲" : kind === "电视剧");
}
