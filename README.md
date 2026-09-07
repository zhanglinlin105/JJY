# 鞠婧祎｜3D 互动人物志

以 Three.js / WebGL2 构建的全屏三维光影档案馆。五个展区共享一个真实三维场景：序厅、代表作、生平经历、影像与关于。保留原项目的 7 部作品、7 条经历、6 张影像、全部来源、署名与版权说明。

## 运行

需要 Node.js 22.13+。

```bash
npm install
npm run dev
```

保留 vinext / Cloudflare Sites 与 Next.js / Vercel 两条原有构建路径。

```bash
npm run build          # Sites / Cloudflare
npm run build:vercel   # Next.js / Vercel
npm test              # 构建 + 内容、筛选、空间布局与射线拾取测试
npm run lint
npx tsc --noEmit
```

## 交互

- 顶部导航或方向键：切换展区，相机在空间中飞行；保留 URL 锚点和前进/后退。
- 拖拽：环绕视角；滚轮、双指或加减按钮：缩放；R 或重置按钮：回到展区全景。
- 点击空间展品：聚焦并显示完整介绍、官方作品链接或影像来源。
- 代表作支持全部 / 电视剧 / 音乐筛选，分别显示 7 / 6 / 1 部。
- 自动环绕可随时暂停。展馆支持 360° 浏览，影像展板具有厚度和双面材质。
- “阅读档案”包含原站全部内容；支持键盘、无 JavaScript 和 WebGL 不可用时阅读。Esc 关闭详情或阅读面板。

## 实现

- `app/archive-data.ts`：从原页面完整提取的作品、经历、影像与来源数据。
- `app/ArchiveExperience.tsx`：展区状态、导航、可访问控件、详情和阅读面板。
- `app/create-archive-scene.ts`：延迟加载的 Three.js 引擎；实际几何体、材质、灯光、着色器地面、粒子、OrbitControls 与 Raycaster。
- `app/scene-layout.ts`：展区坐标、曲线展陈布局和共享筛选规则。
- `app/ArchiveContent.tsx` / `app/WorksShowcase.tsx`：保留原始内容的完整阅读层。
- `app/globals.css`：空间界面的暗色视觉与响应式样式。

影像按展区加载，纹理长边限制为 1280 像素且跨展区复用；设备像素比和总绘制像素受限。后台页面或阅读模式暂停动画，尊重减少动态效果偏好。卸载时释放几何体、材质、纹理、事件与渲染循环；处理 WebGL 上下文中断和恢复。

空间是实时三维渲染，照片作为三维展板的纹理展示，并非人物三维扫描模型。

## 内容维护

请在 `app/archive-data.ts` 维护作品和来源。原始版权说明位于 `app/ArchiveContent.tsx`，新增资源时应同步补充作者、许可、作品官方页面与图片说明。人物经历和作品信息沿用原站，未在本次视觉改造中另行核验。
