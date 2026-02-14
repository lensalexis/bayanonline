/**
 * JeskoJets Scroll — HubSpot bundle entry.
 * Mounts markup into #jesko-mount, then initializes GSAP + ScrollTrigger + Lenis.
 * All selectors are scoped to the mounted block.
 */
import './style.css';
import { markup } from './markup';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

function getMountRoot() {
  let root = document.getElementById('jesko-mount');
  if (!root) {
    root = document.createElement('div');
    root.id = 'jesko-mount';
    document.body.appendChild(root);
  }
  return root;
}

function mountMarkup() {
  const root = getMountRoot();
  root.innerHTML = markup.trim();
  return root;
}

function init() {
  const root = document.getElementById('jesko-mount');
  if (!root) return;

  const block = root.querySelector('.jeskojets-scroll-block');
  if (!block) return;

  const win = block.querySelector('.window-container');
  const sky = block.querySelector('.sky-container');
  const copy = block.querySelector('.hero-copy');
  const head = block.querySelector('.hero-header');

  if (!win || !sky) return;

  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll (shorter duration on mobile for snappier feel)
  const isMobile = window.matchMedia('(max-width: 900px)').matches || 'ontouchstart' in window;
  const lenis = new Lenis({
    duration: isMobile ? 0.9 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Initial state: reveal text below, hidden
  gsap.set(copy, { yPercent: 100, opacity: 0 });

  const skyDist = sky.offsetHeight - window.innerHeight;

  ScrollTrigger.create({
    trigger: block.querySelector('.hero'),
    start: 'top top',
    end: '+=300%',
    pin: true,
    scrub: 1,
    onUpdate(self) {
      const p = self.progress;

      const scale = p <= 0.5 ? 1 + (p / 0.5) * 1 : 2 + ((p - 0.5) / 0.5) * 8;
      gsap.set(win, { scale });

      gsap.set(head, {
        z: p * 500,
        opacity: 1 - p * 2,
        display: p > 0.6 ? 'none' : 'flex',
      });

      gsap.set(sky, { y: -p * skyDist });

      let copyY = 100;
      let copyOp = 0;
      if (p > 0.6) {
        const phase = (p - 0.6) / 0.4;
        copyY = 100 * (1 - phase);
        copyOp = phase;
      }
      gsap.set(copy, { yPercent: copyY, opacity: copyOp });
    },
  });

  // Parallax images (codegrid-nextjs-parallax-effect style: scroll-linked translateY + scale)
  const lerp = (start, end, factor) => start + (end - start) * factor;
  const parallaxImgs = block.querySelectorAll('.parallax-content .parallax-img img');
  const parallaxState = Array.from(parallaxImgs).map(() => ({
    top: 0,
    currentY: 0,
    targetY: 0,
  }));

  function updateParallaxBounds() {
    parallaxImgs.forEach((img, i) => {
      const rect = img.getBoundingClientRect();
      const scrollY = window.scrollY ?? document.documentElement.scrollTop;
      parallaxState[i].top = rect.top + scrollY;
    });
  }

  lenis.on('scroll', ({ scroll }) => {
    parallaxState.forEach((state, i) => {
      state.targetY = (scroll - state.top) * 0.2;
    });
  });

  gsap.ticker.add(() => {
    parallaxImgs.forEach((img, i) => {
      const state = parallaxState[i];
      state.currentY = lerp(state.currentY, state.targetY, 0.1);
      if (Math.abs(state.currentY - state.targetY) > 0.01) {
        img.style.transform = `translateY(${state.currentY}px) scale(1.5)`;
      }
    });
  });

  updateParallaxBounds();
  window.addEventListener('resize', () => {
    updateParallaxBounds();
    ScrollTrigger.refresh();
  });

  // --- Scroll text reveal (terminal-style: lines slide up into view) ---
  function splitTextIntoLines(el) {
    const html = el.innerHTML;
    const parts = html.split(/<br\s*\/?>/i).map((p) => p.trim());
    if (parts.length === 0) return [];
    el.innerHTML = '';
    const lines = [];
    parts.forEach((part) => {
      const mask = document.createElement('span');
      mask.className = 'text-reveal-line-mask';
      const line = document.createElement('span');
      line.className = 'text-reveal-line';
      line.innerHTML = part || '\u00A0';
      mask.appendChild(line);
      el.appendChild(mask);
      lines.push(line);
    });
    return lines;
  }

  const textRevealSelectors = [
    'h1', 'h2', 'h3', 'p',
    '.p-hero-copy p',
    '.p-disciplines li', '.p-projects-rigor-list li',
    '.p-impact-amount', '.p-impact-desc',
    '.p-banner-cards-title',
    '.p-checker-slide-title', '.p-checker-slide-desc',
    '.p-checker-footer p',
  ].join(', ');
  const textRevealElements = [...block.querySelectorAll(textRevealSelectors)]
    .filter((el) => !el.closest('.hero-copy') && !el.closest('.hero-header'));

  textRevealElements.forEach((el) => {
    const lines = splitTextIntoLines(el);
    if (lines.length === 0) return;
    gsap.set(lines, { yPercent: 100 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      end: 'top 35%',
      scrub: 1,
      onUpdate(self) {
        const progress = self.progress;
        const stagger = 0.14;
        const revealDuration = 0.22;
        lines.forEach((line, i) => {
          const lineStart = i * stagger;
          const lineEnd = lineStart + revealDuration;
          const lineProgress =
            progress <= lineStart ? 0 : progress >= lineEnd ? 1 : (progress - lineStart) / revealDuration;
          gsap.set(line, { yPercent: 100 - lineProgress * 100 });
        });
      },
    });
  });
}

// Mount first, then run init after load + short delay so measurements are correct
mountMarkup();

if (document.readyState === 'complete') {
  init();
  setTimeout(() => ScrollTrigger.refresh(true), 300);
} else {
  window.addEventListener('load', () => {
    init();
    setTimeout(() => ScrollTrigger.refresh(true), 300);
  });
}
