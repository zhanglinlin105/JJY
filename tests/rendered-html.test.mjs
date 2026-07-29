import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
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
  assert.match(hero, /hero-character\.webp/);
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

test("locks detail state, reclassifies on resize, and enforces hero budgets", async () => {
  const [scene, hero, css, desktopBackdrop, desktopCharacter, mobileBackdrop, mobileCharacter] =
    await Promise.all([
      readFile(new URL("../app/SceneController.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/HeroExperience.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      stat(new URL("../public/images/3d/hero-backdrop.webp", import.meta.url)),
      stat(new URL("../public/images/3d/hero-character.webp", import.meta.url)),
      stat(new URL("../public/images/3d/hero-backdrop-mobile.webp", import.meta.url)),
      stat(new URL("../public/images/3d/hero-character-mobile.webp", import.meta.url)),
    ]);

  assert.match(scene, /const detailOpenRef = useRef\(false\)/);
  assert.match(scene, /if \(tierRef\.current !== "full" \|\| detailOpenRef\.current\) return/);
  assert.match(scene, /const handleBlur[\s\S]*if \(detailOpenRef\.current\) return/);
  assert.match(scene, /detailOpenRef\.current = true[\s\S]*commitSceneState\("DETAIL_OPEN"\)/);
  assert.match(scene, /const handleResize[\s\S]*detectTier\(preferenceRef\.current\)/);
  assert.match(scene, /window\.addEventListener\("resize", handleResize\)/);
  assert.match(scene, /scene:tierchange/);

  assert.match(hero, /scene:tierchange/);
  assert.match(hero, /nextTier !== "full"/);
  assert.match(hero, /hero-backdrop-mobile\.webp/);
  assert.match(hero, /hero-character-mobile\.webp/);
  assert.match(css, /sceneRoot:not\(\[data-scene-tier="full"\]\) \.orbitToggle/);
  assert.match(
    css,
    /data-scene-tier="full"\]\[data-scene-state="AUTO_ORBIT"\] \.hero3dWorld/,
  );

  const desktopHeroBytes = desktopBackdrop.size + desktopCharacter.size;
  const mobileHeroBytes = mobileBackdrop.size + mobileCharacter.size;
  assert.ok(
    desktopHeroBytes <= 1_800_000,
    `desktop hero resources exceed 1.8 MB: ${desktopHeroBytes} bytes`,
  );
  assert.ok(
    mobileHeroBytes <= 900_000,
    `mobile hero resources exceed 900 KB: ${mobileHeroBytes} bytes`,
  );
});
