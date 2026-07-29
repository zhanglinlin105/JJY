"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  file: string;
  className: string;
  width: number;
  height: number;
};

export default function GalleryShowcase({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = selectedIndex === null ? null : images[selectedIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selected && dialog && !dialog.open) {
      dialog.showModal();
      window.dispatchEvent(
        new CustomEvent("scene:detail", { detail: { open: true } }),
      );
    }
  }, [selected]);

  const moveSelection = (direction: -1 | 1) => {
    setSelectedIndex((current) => {
      if (current === null) return current;
      return (current + direction + images.length) % images.length;
    });
  };

  const handleClosed = () => {
    const index = selectedIndex;
    setSelectedIndex(null);
    window.dispatchEvent(
      new CustomEvent("scene:detail", { detail: { open: false } }),
    );
    if (index !== null) triggerRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") moveSelection(-1);
    if (event.key === "ArrowRight") moveSelection(1);
  };

  return (
    <>
      <div className="galleryGrid">
        {images.map((image, index) => (
          <figure className={image.className} key={image.src}>
            <button
              className="galleryImageWrap"
              type="button"
              aria-label={`沉浸查看：${image.caption}`}
              data-scene-hotspot
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
              />
              <span className="galleryOpen" aria-hidden="true">
                查看影像
              </span>
            </button>
            <figcaption>
              <span>{image.caption}</span>
              <a href={image.file} target="_blank" rel="noreferrer">
                来源 ↗
              </a>
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        className="detailDialog galleryDialog"
        ref={dialogRef}
        onClose={handleClosed}
        onKeyDown={handleKeyDown}
        aria-labelledby="gallery-dialog-title"
      >
        {selected ? (
          <div className="galleryDialogPanel">
            <button
              className="detailClose"
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="关闭影像查看"
            >
              关闭 ×
            </button>
            <figure>
              <img
                src={selected.src}
                alt={selected.alt}
                width={selected.width}
                height={selected.height}
              />
              <figcaption>
                <div>
                  <p className="eyebrow">PORTRAIT / {String(selectedIndex! + 1).padStart(2, "0")}</p>
                  <h3 id="gallery-dialog-title">{selected.caption}</h3>
                </div>
                <a href={selected.file} target="_blank" rel="noreferrer">
                  查看原图与署名 ↗
                </a>
              </figcaption>
            </figure>
            <div className="detailPager galleryPager" aria-label="切换影像">
              <button type="button" onClick={() => moveSelection(-1)}>
                ← 上一张
              </button>
              <span>
                {String(selectedIndex! + 1).padStart(2, "0")}/
                {String(images.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => moveSelection(1)}>
                下一张 →
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
