"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type SceneTier = "full" | "lite" | "static";
type SceneState =
  | "PASSIVE"
  | "ENGAGED"
  | "FOCUSED"
  | "DETAIL_OPEN"
  | "AUTO_ORBIT"
  | "REDUCED";
type MotionPreference = "motion" | "static";

const chapters = ["top", "works", "journey", "gallery", "about"] as const;
const storageKey = "jjy-scene-preference";

type ExtendedNavigator = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

function detectTier(preference: MotionPreference): SceneTier {
  if (preference === "static") return "static";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navigatorWithCapabilities = navigator as ExtendedNavigator;
  if (reduced || navigatorWithCapabilities.connection?.saveData) return "static";

  const capabilityCanvas = document.createElement("canvas");
  const gl = capabilityCanvas.getContext("webgl2", {
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
  });
  const textureLimit = gl?.getParameter(gl.MAX_TEXTURE_SIZE) ?? 0;
  const memory = navigatorWithCapabilities.deviceMemory ?? 4;
  const supportsFullScene =
    window.innerWidth >= 1024 && Boolean(gl) && textureLimit >= 4096 && memory >= 4;

  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return supportsFullScene ? "full" : "lite";
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createSceneRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vertex = createShader(
    gl,
    gl.VERTEX_SHADER,
    `#version 300 es
      in vec2 position;
      out vec2 uv;
      void main() {
        uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }`,
  );
  const fragment = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    `#version 300 es
      precision highp float;
      in vec2 uv;
      out vec4 outputColor;
      uniform vec2 resolution;
      uniform vec2 pointer;
      uniform float progress;

      float hash(vec2 value) {
        return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 centered = uv - 0.5;
        centered.x *= resolution.x / max(resolution.y, 1.0);
        vec3 wine = vec3(0.20, 0.035, 0.075);
        vec3 silver = vec3(0.33, 0.30, 0.29);
        vec3 ink = vec3(0.035, 0.02, 0.03);
        vec3 pearl = vec3(0.72, 0.62, 0.58);
        float chapterWave = smoothstep(0.05, 0.72, progress);
        vec3 base = mix(wine, ink, chapterWave);
        base = mix(base, silver * 0.23, smoothstep(0.76, 1.0, progress));

        vec2 lightPoint = vec2(pointer.x * 0.18, pointer.y * -0.12);
        float glow = exp(-3.2 * length(centered - lightPoint));
        float horizon = exp(-18.0 * abs(centered.y + 0.30 - progress * 0.12));
        float gridX = smoothstep(0.975, 1.0, cos((centered.x + progress) * 38.0));
        float gridY = smoothstep(0.985, 1.0, cos((centered.y - progress * 0.4) * 44.0));
        float grid = (gridX + gridY) * smoothstep(0.9, 0.08, length(centered));

        vec2 starCell = floor((uv + vec2(progress * 0.03, 0.0)) * vec2(96.0, 54.0));
        float stars = step(0.993, hash(starCell)) * smoothstep(0.85, 0.12, length(centered));
        vec3 color = base + pearl * glow * 0.16 + pearl * horizon * 0.055;
        color += vec3(0.48, 0.28, 0.34) * grid * 0.045;
        color += vec3(0.95, 0.78, 0.82) * stars * 0.22;
        outputColor = vec4(color, 0.78);
      }`,
  );
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "position");
  const resolution = gl.getUniformLocation(program, "resolution");
  const progress = gl.getUniformLocation(program, "progress");
  const pointer = gl.getUniformLocation(program, "pointer");

  return {
    render(sceneProgress: number, x: number, y: number) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(progress, sceneProgress);
      gl.uniform2f(pointer, x, y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

export default function SceneController({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createSceneRenderer>>(null);
  const frameRef = useRef<number | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const detailOpenRef = useRef(false);
  const preferenceRef = useRef<MotionPreference>("motion");
  const tierRef = useRef<SceneTier>("static");
  const sceneStateRef = useRef<SceneState>("REDUCED");
  const stateBeforeDetail = useRef<SceneState>("PASSIVE");
  const [preference, setPreference] = useState<MotionPreference>("motion");
  const [tier, setTier] = useState<SceneTier>("static");
  const [sceneState, setSceneState] = useState<SceneState>("REDUCED");
  const [activeChapter, setActiveChapter] = useState<(typeof chapters)[number]>("top");
  const [fallbackMessage, setFallbackMessage] = useState("");

  const commitSceneState = useCallback((nextState: SceneState) => {
    sceneStateRef.current = nextState;
    setSceneState(nextState);
  }, []);

  const applyTier = useCallback(
    (nextTier: SceneTier) => {
      const changed = tierRef.current !== nextTier;
      tierRef.current = nextTier;
      if (changed) {
        setTier(nextTier);
        window.dispatchEvent(
          new CustomEvent("scene:tierchange", { detail: { tier: nextTier } }),
        );
      }

      const restingState: SceneState = nextTier === "static" ? "REDUCED" : "PASSIVE";
      if (detailOpenRef.current) {
        stateBeforeDetail.current = restingState;
      } else {
        commitSceneState(restingState);
      }
    },
    [commitSceneState],
  );

  const applyPreference = useCallback(
    (nextPreference: MotionPreference) => {
      preferenceRef.current = nextPreference;
      setPreference(nextPreference);
      applyTier(detectTier(nextPreference));
      window.localStorage.setItem(storageKey, nextPreference);
    },
    [applyTier],
  );

  const renderScene = useCallback(() => {
    rendererRef.current?.render(
      progressRef.current,
      pointerRef.current.x,
      pointerRef.current.y,
    );
  }, []);

  const scheduleSceneUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const root = rootRef.current;
      if (!root) return;

      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? Math.min(Math.max(window.scrollY / documentHeight, 0), 1) : 0;
      progressRef.current = progress;
      root.style.setProperty("--scene-progress", progress.toFixed(4));

      const probe = window.innerHeight * 0.42;
      let nextChapter = chapters[0];
      let localProgress = 0;
      chapters.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= probe) {
          nextChapter = id;
          localProgress = Math.min(Math.max((probe - rect.top) / Math.max(rect.height, 1), 0), 1);
        }
      });
      root.style.setProperty("--scene-local", localProgress.toFixed(4));
      setActiveChapter((current) => {
        if (current !== nextChapter) {
          window.dispatchEvent(
            new CustomEvent("scene:chapterchange", { detail: { chapter: nextChapter } }),
          );
        }
        return nextChapter;
      });
      renderScene();
    });
  }, [renderScene]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(storageKey);
      applyPreference(stored === "static" ? "static" : "motion");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [applyPreference]);

  useEffect(() => {
    if (tier !== "full" || !canvasRef.current) {
      rendererRef.current?.destroy();
      rendererRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    const renderer = createSceneRenderer(canvas);
    if (!renderer) {
      applyTier("lite");
      return;
    }
    rendererRef.current = renderer;
    renderScene();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      rendererRef.current = null;
      tierRef.current = "static";
      setTier("static");
      window.dispatchEvent(
        new CustomEvent("scene:tierchange", { detail: { tier: "static" } }),
      );
      if (detailOpenRef.current) {
        stateBeforeDetail.current = "REDUCED";
      } else {
        commitSceneState("REDUCED");
      }
      setFallbackMessage("空间场景已暂停，正文已切换为静态阅读。");
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      renderer.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [applyTier, commitSceneState, renderScene, tier]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (tierRef.current !== "full" || detailOpenRef.current) return;
      const x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      const y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      pointerRef.current = { x, y };
      const root = rootRef.current;
      root?.style.setProperty("--scene-rx", `${(-y * 3).toFixed(2)}deg`);
      root?.style.setProperty("--scene-ry", `${(x * 6).toFixed(2)}deg`);
      root?.style.setProperty("--scene-x", `${(x * 18).toFixed(2)}px`);
      root?.style.setProperty("--scene-y", `${(y * 10).toFixed(2)}px`);
      root?.style.setProperty("--light-x", `${(50 + x * 16).toFixed(2)}%`);
      root?.style.setProperty("--light-y", `${(42 + y * 12).toFixed(2)}%`);
      if (
        sceneStateRef.current !== "AUTO_ORBIT" &&
        sceneStateRef.current !== "FOCUSED"
      ) {
        commitSceneState("ENGAGED");
      }
      renderScene();
    };
    const handlePointerLeave = () => {
      if (detailOpenRef.current) return;
      pointerRef.current = { x: 0, y: 0 };
      if (sceneStateRef.current !== "AUTO_ORBIT") commitSceneState("PASSIVE");
      renderScene();
    };
    const handleFocus = (event: FocusEvent) => {
      if (detailOpenRef.current) return;
      const target = event.target as HTMLElement;
      if (target.closest("[data-scene-hotspot]")) commitSceneState("FOCUSED");
    };
    const handleBlur = () => {
      window.requestAnimationFrame(() => {
        if (detailOpenRef.current) return;
        if (!(document.activeElement as HTMLElement | null)?.closest("[data-scene-hotspot]")) {
          commitSceneState(tierRef.current === "static" ? "REDUCED" : "PASSIVE");
        }
      });
    };
    const handleDetail = (event: Event) => {
      const open = (event as CustomEvent<{ open: boolean }>).detail.open;
      if (open) {
        if (detailOpenRef.current) return;
        stateBeforeDetail.current = sceneStateRef.current;
        detailOpenRef.current = true;
        commitSceneState("DETAIL_OPEN");
      } else {
        if (!detailOpenRef.current) return;
        detailOpenRef.current = false;
        commitSceneState(
          tierRef.current === "static" ? "REDUCED" : stateBeforeDetail.current,
        );
        scheduleSceneUpdate();
      }
    };
    const handleOrbit = (event: Event) => {
      if (detailOpenRef.current || tierRef.current !== "full") return;
      const enabled = (event as CustomEvent<{ enabled: boolean }>).detail.enabled;
      commitSceneState(enabled ? "AUTO_ORBIT" : "PASSIVE");
    };
    const handleNudge = (event: Event) => {
      if (detailOpenRef.current || tierRef.current === "static") return;
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;
      pointerRef.current = { x, y };
      rootRef.current?.style.setProperty("--scene-rx", `${(-y * 3).toFixed(2)}deg`);
      rootRef.current?.style.setProperty("--scene-ry", `${(x * 6).toFixed(2)}deg`);
      rootRef.current?.style.setProperty("--scene-x", `${(x * 18).toFixed(2)}px`);
      rootRef.current?.style.setProperty("--scene-y", `${(y * 10).toFixed(2)}px`);
      commitSceneState(x === 0 && y === 0 ? "PASSIVE" : "FOCUSED");
      renderScene();
    };
    const handleResize = () => {
      scheduleSceneUpdate();
      if (resizeFrameRef.current !== null) return;
      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        applyTier(detectTier(preferenceRef.current));
      });
    };

    window.addEventListener("scroll", scheduleSceneUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);
    window.addEventListener("scene:detail", handleDetail);
    window.addEventListener("scene:orbit", handleOrbit);
    window.addEventListener("scene:nudge", handleNudge);
    scheduleSceneUpdate();

    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
      window.removeEventListener("scroll", scheduleSceneUpdate);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
      window.removeEventListener("scene:detail", handleDetail);
      window.removeEventListener("scene:orbit", handleOrbit);
      window.removeEventListener("scene:nudge", handleNudge);
    };
  }, [applyTier, commitSceneState, renderScene, scheduleSceneUpdate]);

  return (
    <div
      className="sceneRoot"
      data-scene-tier={tier}
      data-scene-state={sceneState}
      data-scene-active={activeChapter}
      ref={rootRef}
    >
      <div className="sceneAtmosphere" aria-hidden="true">
        <canvas className="sceneCanvas" ref={canvasRef} />
        <div className="sceneFallback" />
        <div className="sceneVignette" />
      </div>

      <div className="sceneModeControl" role="group" aria-label="页面动态效果">
        <button
          type="button"
          aria-pressed={preference === "motion"}
          onClick={() => {
            setFallbackMessage("");
            applyPreference("motion");
          }}
        >
          动态效果
        </button>
        <button
          type="button"
          aria-pressed={preference === "static"}
          onClick={() => applyPreference("static")}
        >
          静态阅读
        </button>
      </div>
      <p className="sceneStatus" aria-live="polite">
        {fallbackMessage}
      </p>

      <div className="sceneDocument">{children}</div>
    </div>
  );
}
