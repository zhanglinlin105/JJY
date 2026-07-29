# 鞠婧祎｜个人主页

一个以当代人物志为视觉方向的鞠婧祎非官方资料页，集中呈现代表作品、职业时间线、公开影像与资料来源。

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## 项目结构

- `app/page.tsx`：人物内容与页面结构
- `app/SiteHeader.tsx`：长页进度、当前章节与移动导航
- `app/WorksShowcase.tsx`：代表作筛选与作品跳转
- `app/globals.css`：编辑式视觉系统与响应式布局
- `public/images/`：人物与作品图片

## 常用命令

- `npm run dev`：启动本地开发
- `npm run build`：生成部署产物
- `npm test`：构建并验证服务端渲染、导航和筛选能力
- `npm run lint`：检查代码规范

## 内容维护

新增作品时，请同步补充作品来源、封面尺寸与版权说明。涉及上映时间、平台或人物经历的描述，应以官方可核实来源为准。
