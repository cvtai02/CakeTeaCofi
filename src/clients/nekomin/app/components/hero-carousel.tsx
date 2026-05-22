"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/app/lib/media";
import { ContactLinks } from "./contact-links";

export type HeroSlide = {
  imageKey: string;
  tag: string;
  link: string;
};

const PAW_SVG = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <ellipse cx="20" cy="28" rx="8" ry="7"/>
  <ellipse cx="11" cy="18" rx="4" ry="3.5"/>
  <ellipse cx="29" cy="18" rx="4" ry="3.5"/>
  <ellipse cx="16" cy="12" rx="3" ry="2.5"/>
  <ellipse cx="24" cy="12" rx="3" ry="2.5"/>
</svg>`;

const DURATION = 5000;

export function HeroCarousel({ slides: gallerySlides }: { slides?: HeroSlide[] }) {
  const hasSlides = (gallerySlides?.length ?? 0) > 0;
  const slides = gallerySlides ?? [];

  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const pawBgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!hasSlides) return;
    const bar = barRef.current;
    if (!bar) return;
    const start = performance.now();
    bar.style.transition = "none";
    bar.style.width = "0%";

    const tick = (now: number) => {
      const pct = Math.min(((now - start) / DURATION) * 100, 100);
      bar.style.width = pct + "%";
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setActive((i) => (i + 1) % slides.length);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, hasSlides, slides.length]);

  useEffect(() => {
    const pawBg = pawBgRef.current;
    if (!pawBg) return;

    function spawnShape() {
      const el = document.createElement("div");
      el.className = "shape-float";
      const size = 14 + Math.random() * 28;
      const rot = Math.random() * 360;
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: -60px;
        width: ${size}px; height: ${size}px;
        color: oklch(99% 0.005 68 / 0.4);
        --rot: ${rot}deg;
        animation-duration: ${12 + Math.random() * 14}s;
        animation-delay: ${Math.random() * 6}s;
      `;
      el.innerHTML = PAW_SVG;
      pawBg!.appendChild(el);
      setTimeout(() => el.remove(), 26000);
    }

    for (let i = 0; i < 10; i++) spawnShape();
    const interval = setInterval(spawnShape, 2800);
    return () => clearInterval(interval);
  }, []);

  if (!hasSlides) {
    return (
      <section className="hero" id="hero">
        <div className="hero-slides">
          <div className="hero-slide active">
            <div className="slide-fill">
              <svg
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="mp" width="28" height="28" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="28" x2="28" y2="0" stroke="oklch(75% 0.06 60)" strokeWidth="0.7" />
                  </pattern>
                </defs>
                <rect width="1440" height="900" fill="oklch(84% 0.05 60)" />
                <rect width="1440" height="900" fill="url(#mp)" opacity="0.45" />
              </svg>
            </div>
          </div>
        </div>

        <div className="shape-bg" ref={pawBgRef} />

        <div className="hero-maintenance">
          <p className="hero-maintenance__title">
            Server của chúng tôi hiện đang nâng cấp.
          </p>
          <p className="hero-maintenance__sub">Bạn có thể liên hệ với chúng tôi qua</p>
          <ContactLinks />
        </div>
      </section>
    );
  }

  return (
    <section className="hero" id="hero">
      <div className="hero-slides">
        {slides.map((slide, i) => {
          const imageUrl = resolveMediaUrl(slide.imageKey);
          const inner = (
            <>
              <div className="slide-fill">
                {imageUrl && <Image src={imageUrl} alt={slide.tag} fill style={{ objectFit: "cover" }} />}
              </div>
              <div className="slide-tag">{slide.tag}</div>
            </>
          );
          return (
            <div key={i} className={`hero-slide${i === active ? " active" : ""}`}>
              {slide.link ? (
                <a href={slide.link} className="slide-link" aria-label={slide.tag}>{inner}</a>
              ) : inner}
            </div>
          );
        })}
      </div>

      <div className="shape-bg" ref={pawBgRef} />

      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            className={`hero-dot${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      <div className="hero-progress">
        <div className="hero-progress-bar" ref={barRef} />
      </div>
    </section>
  );
}
