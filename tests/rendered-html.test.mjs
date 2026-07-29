import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete portrait archive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>鞠婧祎｜3D 互动人物志<\/title>/);
  assert.match(html, /id="works"/);
  assert.match(html, /id="journey"/);
  assert.match(html, /id="gallery"/);
  assert.match(html, /id="about"/);
  assert.match(html, /筛选代表作/);
  assert.match(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Codex is working/i);
});

test("keeps the five-chapter scene progressive and accessible", async () => {
  const [page, scene, hero, header, showcase, gallery, css, layout, packageJson, manifest] =
    await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SceneController.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/HeroExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WorksShowcase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/GalleryShowcase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/images/asset-manifest.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<SceneController>/);
  assert.match(page, /<SiteHeader \/>/);
  assert.match(page, /<HeroExperience \/>/);
  assert.match(page, /<WorksShowcase works=\{works\} \/>/);
  assert.match(page, /<GalleryShowcase images=\{gallery\} \/>/);
  assert.equal((page.match(/data-scene=/g) ?? []).length, 4);
  assert.match(scene, /const chapters = \["top", "works", "journey", "gallery", "about"\]/);
  assert.match(scene, /getContext\("webgl2"/);
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /connection\?\.saveData/);
  assert.match(scene, /deviceMemory/);
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /localStorage/);
  assert.match(scene, /DETAIL_OPEN/);
  assert.match(hero, /onKeyDown/);
  assert.match(hero, /aria-pressed/);
  assert.match(hero, /hero-character\.png/);
  assert.doesNotMatch(header, /addEventListener\("scroll"/);
  assert.match(header, /scene:chapterchange/);
  assert.match(header, /aria-current/);
  assert.match(header, /closeMenu/);
  assert.match(showcase, /aria-pressed/);
  assert.match(showcase, /aria-live="polite"/);
  assert.match(showcase, /<dialog/);
  assert.match(showcase, /scene:detail/);
  assert.match(gallery, /<dialog/);
  assert.match(gallery, /查看原图与署名/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /data-scene-tier="static"/);
  assert.match(layout, /鞠婧祎｜3D 互动人物志/);
  assert.match(layout, /og-spatial\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(manifest, /CC BY-SA 4\.0/);
  assert.match(manifest, /hero-character\.png/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
