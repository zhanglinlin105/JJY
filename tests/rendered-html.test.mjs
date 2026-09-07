import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import * as THREE from "three";

const data = await import("../app/archive-data.ts");
const layout = await import("../app/scene-layout.ts");
let response;
let html;

test("server-renders the complete accessible archive alongside the 3D experience", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  html = await response.text();
  assert.match(html, /<title>鞠婧祎｜3D 互动人物志<\/title>/);
  for (const work of data.works) {
    for (const content of [work.title, work.role, work.note]) assert.ok(html.includes(content), `Missing work content: ${content}`);
  }
  for (const moment of data.timeline) {
    assert.ok(html.includes(moment.title));
    assert.ok(html.includes(moment.text));
  }
  for (const photo of data.gallery) {
    assert.ok(html.includes(photo.alt));
    assert.ok(html.includes(photo.caption));
  }
  for (const [label] of data.sources) assert.ok(html.includes(label));
  for (const credit of ["Camellia234", "Aco", "纸鱼_咲", "CC BY-SA 4.0", "CC BY 2.5", "非官方人物资料页"]) assert.ok(html.includes(credit));
  assert.match(html, /<dialog/);
  assert.match(html, /<noscript>/);
  assert.match(html, /展区导航/);
  assert.match(html, /筛选代表作/);
  for (const chapter of layout.chapters) assert.ok(html.includes(`href="#${chapter.id}"`));
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("all retained images exist and official links use HTTPS", async () => {
  const assets = [...data.works.map(work => work.image), ...data.gallery.map(photo => photo.src)];
  await Promise.all(assets.map(asset => access(new URL(`../public${asset}`, import.meta.url))));
  const links = [...data.works.map(work => work.source), ...data.gallery.map(photo => photo.file), ...data.sources.map(([, url]) => url)];
  for (const url of links) assert.equal(new URL(url).protocol, "https:");
});

test("work filters preserve the original 7 / 6 / 1 result counts", () => {
  assert.equal(data.works.length, 7);
  assert.equal(data.timeline.length, 7);
  assert.equal(data.gallery.length, 6);
  for (const [filter, count] of [["all", 7], ["drama", 6], ["music", 1]]) {
    const visible = data.works.filter(work => layout.matchesFilter(work.kind, filter));
    assert.equal(visible.length, count);
  }
});

test("all five rooms remain separate and navigation resolves unknown hashes safely", () => {
  assert.equal(layout.chapterIndex("invalid"), 0);
  for (let i = 0; i < layout.chapters.length; i++) {
    const id = layout.chapters[i].id;
    assert.equal(layout.chapterIndex(id), i);
    assert.deepEqual(layout.roomCenter(id), [i * layout.ROOM_SPACING, 0, 0]);
  }
});

test("curved exhibits can be picked by the real Three.js raycaster from either face", () => {
  const camera = new THREE.PerspectiveCamera(43, 1.6, 0.1, 100);
  const geometry = new THREE.PlaneGeometry(2.62, 1.47);
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  for (const count of [1, 6, 7]) {
    const positions = Array.from({ length: count }, (_, i) => layout.exhibitPosition(i, count));
    assert.equal(new Set(positions.map(position => position.join(","))).size, count);
    for (const [x, , z] of positions) {
      assert.ok(Number.isFinite(x) && Number.isFinite(z));
      const panel = new THREE.Mesh(geometry, material);
      panel.position.set(x, 2.5, z);
      panel.rotation.y = -x * 0.045;
      panel.updateMatrixWorld(true);
      for (const side of [-1, 1]) {
        camera.position.set(x, 2.5, z + side * 8);
        camera.lookAt(panel.position);
        camera.updateMatrixWorld(true);
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = ray.intersectObject(panel);
        assert.ok(hits.length >= 1);
        assert.ok(hits.every(hit => hit.object === panel));
      }
    }
  }
  geometry.dispose();
  material.dispose();
});

test("WebGL is a separately loaded production dependency", async () => {
  const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(manifest.dependencies.three);
  const client = JSON.parse(await readFile(new URL("../dist/client/.vite/manifest.json", import.meta.url), "utf8"));
  assert.ok(Object.values(client).some(entry => entry.isDynamicEntry && entry.src?.includes("create-archive-scene")), "Scene must remain lazy loaded");
});
