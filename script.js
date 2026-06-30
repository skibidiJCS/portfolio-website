const meter = document.querySelector(".scroll-meter span");
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const imageCards = document.querySelectorAll(".image-card");
const revealItems = document.querySelectorAll(".reveal");
const scrollStory = document.querySelector(".scroll-story");
const storyTrack = document.querySelector(".story-track");
const storySlides = document.querySelectorAll(".story-slide");
const storyWindows = document.querySelectorAll(".story-window");
const themeSections = document.querySelectorAll("main > section");
const hero = document.querySelector(".hero");
const heroStage = document.querySelector(".hero-stage");
const monogramLetters = {
  j: document.querySelector('[data-jcs-letter="j"]'),
  c: document.querySelector('[data-jcs-letter="c"]'),
  s: document.querySelector('[data-jcs-letter="s"]'),
};
const monogramSources = {
  j: document.querySelector('[data-jcs-source="j"]'),
  c: document.querySelector('[data-jcs-source="c"]'),
  s: document.querySelector('[data-jcs-source="s"]'),
};
let heroLetterStarts = null;
let heroLetterStartWidth = 0;
const chapters = document.querySelectorAll(".chapter");
const hasNativeChapterTimeline = Boolean(
  window.CSS?.supports?.("animation-timeline: view()") &&
  window.CSS?.supports?.("view-timeline-name: --chapter-motion")
);
const chapterTravel = new WeakMap();
const signatureSection = document.querySelector(".signature-section");
const signatureGraphic = document.querySelector(".jcs-signature");
const signaturePaths = Array.from(document.querySelectorAll(".jcs-signature path"));
const signatureStrokePadding = 28;
const signatureLengths = signaturePaths.map((path) => {
  const length = path.getTotalLength();
  const hiddenLength = length + signatureStrokePadding;
  path.style.strokeDasharray = `${hiddenLength.toFixed(2)} ${hiddenLength.toFixed(2)}`;
  path.style.strokeDashoffset = hiddenLength.toFixed(2);
  path.style.opacity = "0";
  path.style.visibility = "hidden";
  return length;
});

const signatureTotalLength = signatureLengths.reduce((total, length) => total + length, 0) || 1;
const signatureDrawTime = 1540;
const signaturePenLift = 24;
const signatureDurations = signatureLengths.map((length) =>
  Math.max(220, (length / signatureTotalLength) * signatureDrawTime)
);

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

const playSignature = async () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (let index = 0; index < signaturePaths.length; index += 1) {
    const path = signaturePaths[index];
    const length = signatureLengths[index];
    const hiddenLength = length + signatureStrokePadding;
    path.style.visibility = "visible";
    path.style.opacity = "1";

    if (reducedMotion) {
      path.style.strokeDashoffset = "0";
      continue;
    }

    const animation = path.animate(
      [
        { strokeDashoffset: hiddenLength.toFixed(2) },
        { strokeDashoffset: "0" },
      ],
      {
        duration: signatureDurations[index],
        easing: "cubic-bezier(0.37, 0, 0.63, 1)",
        fill: "forwards",
      }
    );

    try {
      await animation.finished;
    } catch {
      // Keep the final stroke state if the browser interrupts an animation.
    }
    path.style.strokeDashoffset = "0";
    await wait(signaturePenLift);
  }
};

if (signatureSection && signatureGraphic && signaturePaths.length) {
  const signatureObserver = new IntersectionObserver(
    (entries, observer) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      signatureSection.classList.add("signature-active");
      observer.disconnect();
      requestAnimationFrame(playSignature);
    },
    {
      threshold: 0.55,
      rootMargin: "0px",
    }
  );
  signatureObserver.observe(signatureGraphic);
}
const reactiveItems = document.querySelectorAll(".skill-group, .education-panel");
const projectStack = document.querySelector(".project-stack");
const layerCards = Array.from(document.querySelectorAll(".layer-card"));
const projectSnapDots = document.querySelector(".project-snap-dots");
const detailCards = document.querySelectorAll("[data-detail-image]");
const detailView = document.querySelector(".detail-view");
const detailImage = detailView?.querySelector(".detail-media img");
const detailLabel = detailView?.querySelector(".detail-label");
const detailTitle = detailView?.querySelector(".detail-copy h2");
const detailCopy = detailView?.querySelector(".detail-copy p");
const highlightBlocks = document.querySelectorAll(".text-highlight");
let currentStorySlide = null;
let highlightResizeTimer = null;
const jcsScrollStart = 0.018;

const updateViewportWidth = () => {
  document.documentElement.style.setProperty("--viewport-width", `${document.documentElement.clientWidth}px`);
};

const updateMobileHeroLayout = () => {
  if (!heroStage) return;

  const isPortraitMobile = window.innerWidth <= 860 && window.innerHeight > 560;
  if (!isPortraitMobile) {
    heroStage.style.removeProperty("--hero-photo-size");
    heroStage.style.removeProperty("--hero-photo-half-height");
    heroStage.style.removeProperty("--hero-square-size");
    heroStage.style.removeProperty("--hero-square-half");
    return;
  }

  const heroContent = heroStage.querySelector(".hero-content");
  if (!heroContent) return;

  const contentBottom = heroContent.offsetTop + heroContent.offsetHeight;
  const availableHeight = Math.max(88, heroStage.clientHeight - contentBottom - 44);
  const photoWidth = Math.min(window.innerWidth * 0.82, 390, availableHeight * 1.08);
  const photoHeight = photoWidth / 1.08;
  const squareWidth = Math.min(window.innerWidth * 0.92, 430, photoWidth * 1.12);

  heroStage.style.setProperty("--hero-photo-size", `${photoWidth.toFixed(2)}px`);
  heroStage.style.setProperty("--hero-photo-half-height", `${(photoHeight / 2).toFixed(2)}px`);
  heroStage.style.setProperty("--hero-square-size", `${squareWidth.toFixed(2)}px`);
  heroStage.style.setProperty("--hero-square-half", `${(squareWidth / 2).toFixed(2)}px`);
};

const updateChapterTravel = () => {
  const viewportWidth = document.documentElement.clientWidth;
  const isMobile = viewportWidth < 700;
  const baseTravel = viewportWidth * (isMobile ? 0.16 : 0.22);

  chapters.forEach((chapter) => {
    const word = chapter.querySelector("b");
    const wordWidth = word?.getBoundingClientRect().width || 0;
    const revealClearance = isMobile
      ? Math.max(0, (wordWidth - viewportWidth) * 0.5 + 24)
      : 0;
    const visibilityMultiplier = chapter.classList.contains("chapter-education") ? 2.7 : 1;
    const travel = Math.max(baseTravel, revealClearance * visibilityMultiplier);
    chapterTravel.set(chapter, travel);
    chapter.style.setProperty("--chapter-travel", `${travel.toFixed(2)}px`);
  });
};

window.setTimeout(() => {
  document.body.classList.remove("intro-lock");
  updateScroll();
  /* Freeze intro-animation end-state so the forwards fill is no longer
     needed.  When .scrolling is later toggled, the base styles will be
     the final resting values and no transform jump can occur. */
  hero?.querySelectorAll(".hero-name-first, .hero-name-last, .eyebrow, .hero-copy")
    .forEach((el) => {
      el.style.animation = "none";
      el.style.opacity = "1";
      el.style.transform = "none";
    });
}, 3100);

const updateScroll = () => {
  updateViewportWidth();
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max <= 0 ? 0 : (window.scrollY / max) * 100;
  meter.style.transform = `scaleX(${Math.min(1, Math.max(0, progress / 100))})`;

  document.documentElement.style.setProperty("--scroll", progress.toFixed(2));
  if (signatureSection) {
    const signatureRect = signatureSection.getBoundingClientRect();
    document.body.classList.toggle("signature-zone", signatureRect.top < window.innerHeight * 0.94);
  }
  updateHeroTransition();
  updateChapterProgress();
  updateStoryTrack();
  updateTheme();
  updateHighlights();
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const chapterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("chapter-visible");
      chapterObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

chapters.forEach((chapter) => chapterObserver.observe(chapter));

const getHighlightSource = (block) => {
  if (!block.dataset.highlightText) {
    block.dataset.highlightText = block.dataset.lines || block.textContent.replace(/\s+/g, " ").trim();
  }

  return block.dataset.highlightText;
};

const splitHighlightLines = (block) => {
  const preferredLines = getHighlightSource(block)
    .split("|")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!preferredLines.length) return;

  const measure = document.createElement("span");
  measure.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0;display:inline-block;";
  block.appendChild(measure);

  const maxWidth = Math.max(1, block.getBoundingClientRect().width);
  const lines = [];
  const measureWidth = (text) => {
    measure.textContent = text;
    return measure.getBoundingClientRect().width;
  };
  const splitLongWord = (word) => {
    if (measureWidth(word) <= maxWidth) return [word];

    const hyphenChunks = word.includes("-")
      ? word
          .split("-")
          .map((chunk, index, chunks) => (index < chunks.length - 1 ? `${chunk}-` : chunk))
          .filter(Boolean)
      : [word];

    if (hyphenChunks.length > 1) return hyphenChunks;

    const chunks = [];
    let chunk = "";
    Array.from(word).forEach((letter) => {
      const next = `${chunk}${letter}`;
      if (chunk && measureWidth(next) > maxWidth) {
        chunks.push(chunk);
        chunk = letter;
      } else {
        chunk = next;
      }
    });
    if (chunk) chunks.push(chunk);
    return chunks;
  };

  preferredLines.forEach((preferredLine) => {
    if (measureWidth(preferredLine) <= maxWidth) {
      lines.push(preferredLine);
      return;
    }

    const words = preferredLine.split(/\s+/).filter(Boolean);
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && measureWidth(next) > maxWidth) {
        lines.push(line);
        const wordLines = splitLongWord(word);
        if (wordLines.length > 1) {
          lines.push(...wordLines.slice(0, -1));
          line = wordLines.at(-1) || "";
        } else {
          line = word;
        }
      } else if (!line && measureWidth(next) > maxWidth) {
        const wordLines = splitLongWord(word);
        lines.push(...wordLines.slice(0, -1));
        line = wordLines.at(-1) || "";
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
  });
  measure.remove();

  const current = Array.from(block.children).map((child) => child.textContent).join("|");
  const baseDelay = Number.parseInt(block.dataset.highlightBase || "180", 10);
  const delayStep = Number.parseInt(block.dataset.highlightStep || "95", 10);
  if (current === lines.join("|")) {
    Array.from(block.children).forEach((child, index) => {
      child.classList.add("highlight-line");
      child.dataset.text = child.textContent.trim();
      child.style.setProperty("--highlight-delay", `${baseDelay + index * delayStep}ms`);
    });
    return;
  }

  const wasVisible = block.classList.contains("is-highlighted");
  block.replaceChildren();
  lines.forEach((lineText, index) => {
    const line = document.createElement("span");
    line.className = "highlight-line";
    line.dataset.text = lineText;
    line.textContent = lineText;
    line.style.setProperty("--highlight-delay", `${baseDelay + index * delayStep}ms`);
    block.appendChild(line);
  });
  if (wasVisible) block.classList.add("is-highlighted");
};

const activateHighlightBlock = (block) => {
  if (block.classList.contains("is-highlighted")) return;

  const profile = block.closest(".profile");
  const projects = block.closest(".projects");
  const closing = block.closest(".closing-inner");

  if (profile) {
    profile.classList.add("highlight-sequence");
    profile.querySelectorAll(".text-highlight").forEach((item) => item.classList.add("is-highlighted"));
    return;
  }

  if (projects) {
    projects.classList.add("highlight-sequence");
    projects.querySelectorAll(".text-highlight").forEach((item) => item.classList.add("is-highlighted"));
    return;
  }

  if (closing) {
    closing.classList.add("highlight-visible");
  }

  block.classList.add("is-highlighted");
};

const updateHighlights = () => {
  highlightBlocks.forEach((block) => {
    if (block.classList.contains("is-highlighted")) return;
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.18) {
      activateHighlightBlock(block);
    }
  });
};

if (highlightBlocks.length) {
  highlightBlocks.forEach(splitHighlightLines);
  const highlightObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activateHighlightBlock(entry.target);
      });
    },
    {
      threshold: 0.42,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  highlightBlocks.forEach((block) => highlightObserver.observe(block));
}

const activateStorySlide = (slide) => {
  if (!slide || slide === currentStorySlide) return;
  currentStorySlide = slide;
  storySlides.forEach((item) => {
    item.classList.toggle("active", item === slide);
  });
};

const updateStoryTrack = () => {
  if (!scrollStory || !storyTrack || !storySlides.length) return;
  if (window.matchMedia("(max-width: 860px)").matches) {
    storyTrack.style.transform = "";
    return;
  }

  const rect = scrollStory.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  const raw = -rect.top / travel;
  const progress = Math.min(1, Math.max(0, raw));
  const easedProgress = progress * progress * (3 - 2 * progress);
  const firstSlide = storySlides[0];
  const lastSlide = storySlides[storySlides.length - 1];
  const storyStyle = getComputedStyle(scrollStory);
  const trackBaseLeft = rect.left + parseFloat(storyStyle.paddingLeft || "0");
  const firstCenter = firstSlide.offsetLeft + firstSlide.offsetWidth / 2;
  const lastCenter = lastSlide.offsetLeft + lastSlide.offsetWidth / 2;
  const viewportCenter = document.documentElement.clientWidth / 2;
  const startShift = viewportCenter - trackBaseLeft - firstCenter;
  const endShift = viewportCenter - trackBaseLeft - lastCenter;
  const shift = startShift + (endShift - startShift) * easedProgress;
  storyTrack.style.transform = `translate3d(${shift}px, 0, 0)`;

  const index = Math.min(storySlides.length - 1, Math.max(0, Math.round(progress * (storySlides.length - 1))));
  activateStorySlide(storySlides[index]);
};

const sectionTheme = (section) => {
  if (!section) return "light";
  if (section.classList.contains("chapter-education")) return "final";
  if (section.classList.contains("chapter-focus")) return "final";
  if (section.classList.contains("chapter-build")) return "light";
  if (section.classList.contains("chapter")) return "dark";
  if (section.classList.contains("education")) return "final";
  if (section.classList.contains("closing")) return "final";
  if (section.classList.contains("signature-section")) return "final";
  if (section.classList.contains("profile")) return "light";
  if (section.classList.contains("achievements")) return "dark";
  if (section.classList.contains("projects")) return "dark";
  return "light";
};

const captureHeroLetterStarts = () => {
  const entries = [
    ["j", monogramSources.j],
    ["c", monogramSources.c],
    ["s", monogramSources.s],
  ];
  if (entries.some(([, source]) => !source)) return;

  heroLetterStarts = entries.map(([, source]) => {
    const rect = source.getBoundingClientRect();
    const lineRect = source.closest(".hero-name-first, .hero-name-last")?.getBoundingClientRect();
    return {
      x: rect.left,
      y: lineRect?.top ?? rect.top,
      fontSize: Number.parseFloat(getComputedStyle(source).fontSize) || 48,
    };
  });
  heroLetterStartWidth = window.innerWidth;
};

const ensureHeroLetterStarts = (progress) => {
  if (!heroLetterStarts || Math.abs(heroLetterStartWidth - window.innerWidth) > 1 || progress < 0.002) {
    captureHeroLetterStarts();
  }
};

const getMonogramTargets = (letters, fontSize) => {
  const isMobile = window.innerWidth < 700;
  const startX = isMobile ? 17 : 24;
  const gap = isMobile ? 6 : 8;
  const canvas = getMonogramTargets.canvas || (getMonogramTargets.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  const family = getComputedStyle(document.body).fontFamily;
  context.font = `900 ${fontSize}px ${family}`;

  let cursor = startX;
  return letters.map((letter) => {
    const target = cursor;
    cursor += context.measureText(letter.textContent.trim()).width + gap;
    return target;
  });
};

const updateHeroTransition = () => {
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
  const raw = -rect.top / (travel + window.innerHeight * 0.5);
  const progress = Math.min(1, Math.max(0, raw));
  const jcsActive = progress > jcsScrollStart;
  Object.values(monogramSources).forEach((source) => {
    if (!source) return;
    source.style.opacity = jcsActive ? "0" : "";
    source.style.color = jcsActive ? "transparent" : "";
    source.style.webkitTextStroke = jcsActive ? "0 transparent" : "";
  });
  document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
  hero.classList.toggle("scrolling", jcsActive);

  if (!heroStage) return;
  ensureHeroLetterStarts(progress);
  const letterProgress = smoothstep(jcsScrollStart, 0.88, progress);
  const opacity = jcsActive ? 1 : 0;
  const sideOpacity = 1 - smoothstep(0.12, 0.5, progress);
  const titleOpacity = 1 - smoothstep(0.22, 0.62, progress);
  const photoOpacity = 1 - smoothstep(0.16, 0.7, progress);
  const sFillProgress = jcsActive ? smoothstep(0.08, 0.72, letterProgress) : 0;
  const sStrokeWidth = 2 * (1 - sFillProgress);
  heroStage.style.setProperty("--hero-side-opacity", sideOpacity.toFixed(3));
  heroStage.style.setProperty("--hero-title-opacity", titleOpacity.toFixed(3));
  heroStage.style.setProperty("--hero-photo-opacity", photoOpacity.toFixed(3));
  heroStage.style.setProperty("--hero-depth", smoothstep(0.03, 0.72, progress).toFixed(4));
  document.documentElement.style.setProperty("--jcs-opacity", opacity.toString());

  const letterEntries = [
    ["j", monogramLetters.j, monogramSources.j],
    ["c", monogramLetters.c, monogramSources.c],
    ["s", monogramLetters.s, monogramSources.s],
  ];
  const validEntries = letterEntries.filter(([, letter, source]) => letter && source);
  if (validEntries.length !== 3) return;

  const finalSize = window.innerWidth < 700 ? 34 : 48;
  const finalTargets = getMonogramTargets(
    validEntries.map(([, letter]) => letter),
    finalSize
  );
  const logoY = window.innerWidth < 700 ? 18 : 23;
  const targetY = logoY;

  validEntries.forEach(([, letter, source], index) => {
    const sourceRect = source.getBoundingClientRect();
    const start = heroLetterStarts?.[index];
    const startSize = start?.fontSize || Number.parseFloat(getComputedStyle(source).fontSize) || finalSize;
    const currentSize = startSize + (finalSize - startSize) * letterProgress;
    const startX = start?.x ?? sourceRect.left;
    const startY = start?.y ?? sourceRect.top;
    const endX = finalTargets[index];
    const endY = targetY;
    const currentX = startX + (endX - startX) * letterProgress;
    const currentY = startY + (endY - startY) * letterProgress;
    letter.style.setProperty("--jcs-size", `${currentSize.toFixed(2)}px`);
    letter.style.setProperty("--jcs-x", `${currentX.toFixed(2)}px`);
    letter.style.setProperty("--jcs-y", `${currentY.toFixed(2)}px`);
    if (index === 2) {
      letter.style.setProperty("--jcs-s-fill", sFillProgress.toFixed(3));
      letter.style.setProperty("--jcs-s-stroke", `${sStrokeWidth.toFixed(2)}px`);
    }
  });
};

const updateChapterProgress = () => {
  if (hasNativeChapterTimeline) return;

  chapters.forEach((chapter) => {
    const maxShift = chapterTravel.get(chapter) || window.innerWidth * 0.22;
    const rect = chapter.getBoundingClientRect();
    const progress = smoothstep(window.innerHeight, -rect.height, rect.top);

    const shift = -maxShift + progress * maxShift * 2;
    const mobileBaton = window.innerWidth < 700;
    const batonWidth = mobileBaton
      ? Math.min(72, Math.max(40, window.innerWidth * 0.16))
      : Math.min(116, Math.max(44, window.innerWidth * 0.07));
    const batonShift = -batonWidth * 1.4 + progress * (window.innerWidth + batonWidth * 2.8);
    const batonScale = 0.55 + Math.sin(progress * Math.PI) * 0.9;
    const batonOpacity = Math.min(1, progress / 0.16, (1 - progress) / 0.16);
    chapter.style.setProperty("--chapter-shift", `${shift.toFixed(2)}px`);
    chapter.style.setProperty("--baton-shift", `${batonShift.toFixed(2)}px`);
    chapter.style.setProperty("--baton-scale", batonScale.toFixed(3));
    chapter.style.setProperty("--baton-opacity", Math.max(0, batonOpacity).toFixed(3));
  });
};

const updateTheme = () => {
  if (!themeSections.length) return;

  const viewportCenter = window.innerHeight / 2;
  let activeSection = themeSections[0];

  themeSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
      activeSection = section;
    }
  });

  const theme = sectionTheme(activeSection);
  const isDark = theme === "dark";
  const isFinal = theme === "final";
  let darkness = isDark ? 1 : 0;
  let finalness = isFinal ? 1 : 0;
  if (window.scrollY < window.innerHeight * 0.9) darkness = 0;
  if (window.scrollY < window.innerHeight * 0.9) finalness = 0;

  document.documentElement.style.setProperty("--darkness", darkness.toFixed(3));
  document.documentElement.style.setProperty("--finalness", finalness.toFixed(3));
  document.body.classList.toggle("theme-dark", darkness === 1);
  document.body.classList.toggle("theme-final", finalness === 1);
  document.body.classList.toggle("theme-light", darkness === 0 && finalness === 0);
};

const smoothstep = (edge0, edge1, value) => {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
};

if (storySlides.length) {
  activateStorySlide(document.querySelector(".story-slide.active") || storySlides[0]);

  if (window.matchMedia("(max-width: 860px)").matches) {
    const storyObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) activateStorySlide(visible.target);
      },
      {
        rootMargin: "-28% 0px -32% 0px",
        threshold: [0.22, 0.38, 0.56, 0.72],
      }
    );

    storySlides.forEach((slide) => storyObserver.observe(slide));
  }
}

imageCards.forEach((card) => {
  const img = card.querySelector("img");
  if (!img) return;

  const label = img.dataset.src ? `Add ${img.dataset.src.split("/").pop()}` : "Add photo";
  card.dataset.photoLabel = label;
  img.addEventListener("load", () => card.classList.add("loaded"));
  img.addEventListener("error", () => {
    img.removeAttribute("src");
    img.removeAttribute("srcset");
    card.classList.remove("loaded");
  });
  if (img.complete && img.naturalWidth) card.classList.add("loaded");
});

let activeLayerIndex = 2;
let layerIsLifted = false;
let layerMotionFrame = 0;
let layerMotionTime = 0;
let layerHoverFrame = 0;
let pendingLayerPointer = null;
const usesCoarseLayerPointer = () => window.matchMedia("(hover: none), (pointer: coarse)").matches;
const mobileProjectMedia = window.matchMedia("(max-width: 860px)");
const isMobileProjectMode = () => mobileProjectMedia.matches;
const layerMotion = layerCards.map(() => ({
  x: 0,
  velocityX: 0,
  y: 0,
  velocityY: 0,
  scale: 0,
  velocityScale: 0,
  rotation: 0,
  velocityRotation: 0,
  targetX: 0,
  targetY: 0,
  targetScale: 0,
  targetRotation: 0,
  layoutX: 0,
  layoutY: 0,
  layoutScale: 0,
  layoutRotation: 0,
  response: 1,
}));

const getLayerFanScales = () => (
  window.innerWidth <= 860
    ? [0.94, 0.97, 1, 0.97, 0.94]
    : [0.92, 0.96, 1, 0.96, 0.92]
);

const applyLayerMotion = () => {
  layerCards.forEach((card, index) => {
    const state = layerMotion[index];
    card.style.setProperty("--motion-x", `${state.x.toFixed(2)}px`);
    card.style.setProperty("--motion-y", `${state.y.toFixed(2)}px`);
    card.style.setProperty("--motion-rotate", `${state.rotation.toFixed(3)}deg`);
    card.style.setProperty("--scale-boost", state.scale.toFixed(4));
  });
};

const springLayerValue = (
  state,
  valueKey,
  velocityKey,
  targetKey,
  stiffness,
  damping,
  maxVelocity,
  delta
) => {
  const value = state[valueKey];
  const velocity = state[velocityKey];
  const acceleration = (state[targetKey] - value) * stiffness - velocity * damping;
  state[velocityKey] = Math.max(
    -maxVelocity,
    Math.min(maxVelocity, velocity + acceleration * delta)
  );
  state[valueKey] = value + state[velocityKey] * delta;

  if (Math.abs(state[targetKey] - state[valueKey]) < 0.01 && Math.abs(state[velocityKey]) < 0.01) {
    state[valueKey] = state[targetKey];
    state[velocityKey] = 0;
    return false;
  }

  return true;
};

const animateLayerMotion = (time) => {
  layerMotionFrame = 0;
  const delta = Math.min(0.032, Math.max(0.008, layerMotionTime ? (time - layerMotionTime) / 1000 : 0.016));
  let moving = false;

  layerMotion.forEach((state) => {
    const response = state.response;
    const responseRoot = Math.sqrt(response);
    moving = springLayerValue(state, "x", "velocityX", "targetX", 260 * response, 30 * responseRoot, 760, delta) || moving;
    moving = springLayerValue(state, "y", "velocityY", "targetY", 270 * response, 31 * responseRoot, 220, delta) || moving;
    moving = springLayerValue(state, "scale", "velocityScale", "targetScale", 300 * response, 35 * responseRoot, 1.2, delta) || moving;
    moving = springLayerValue(state, "rotation", "velocityRotation", "targetRotation", 230 * response, 27 * responseRoot, 15, delta) || moving;
  });

  applyLayerMotion();
  layerMotionTime = time;

  if (moving) {
    layerMotionFrame = requestAnimationFrame(animateLayerMotion);
  } else {
    layerMotionTime = 0;
  }
};

const requestLayerMotion = () => {
  if (layerMotionFrame || !projectStack?.classList.contains("layers-physics")) return;
  layerMotionFrame = requestAnimationFrame(animateLayerMotion);
};

const enableLayerPhysics = () => {
  if (!projectStack || projectStack.classList.contains("layers-physics")) return;
  projectStack.classList.add("layers-physics");
  layerMotion.forEach((state) => {
    state.x = state.targetX;
    state.y = state.targetY;
    state.scale = state.targetScale;
    state.rotation = state.targetRotation;
    state.velocityX = 0;
    state.velocityY = 0;
    state.velocityScale = 0;
    state.velocityRotation = 0;
  });
  applyLayerMotion();
};

const setActiveLayer = (index, { lift = true } = {}) => {
  if (!projectStack || !layerCards.length) return;
  const previousActiveIndex = activeLayerIndex;
  activeLayerIndex = Math.min(layerCards.length - 1, Math.max(0, index));
  const activeChanged = activeLayerIndex !== previousActiveIndex;
  layerIsLifted = lift;
  projectStack.classList.add("has-layer-focus");
  const coarsePointer = usesCoarseLayerPointer();
  const fanScales = getLayerFanScales();
  const activeScale = 1.01;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  layerCards.forEach((card, cardIndex) => {
    const isActive = cardIndex === activeLayerIndex;
    const distance = Math.abs(cardIndex - activeLayerIndex);
    const direction = cardIndex < activeLayerIndex ? -1 : 1;
    const nudge = isActive
      ? 0
      : direction * ((coarsePointer ? 10 : 28) + distance * (coarsePointer ? 6 : 14));
    card.classList.toggle("is-layer-active", isActive);
    card.setAttribute("aria-pressed", isActive ? "true" : "false");
    card.style.zIndex = String(isActive ? 50 : 40 - distance * 5);
    card.style.setProperty("--layer-nudge", `${nudge}px`);

    const state = layerMotion[cardIndex];
    const outwardRotation = isActive
      ? 0
      : direction * Math.min(0.8, 0.32 + distance * 0.12);
    state.layoutX = nudge;
    state.layoutY = isActive && lift ? (coarsePointer ? -4 : -7) : 0;
    state.layoutScale = isActive ? activeScale - fanScales[cardIndex] : 0;
    state.layoutRotation = outwardRotation;
    state.response = isActive ? 1 : Math.max(0.72, 1 - distance * 0.08);
    state.targetX = state.layoutX;
    state.targetY = state.layoutY;
    state.targetScale = state.layoutScale;
    state.targetRotation = state.layoutRotation;

    if (activeChanged && projectStack.classList.contains("layers-physics")) {
      state.velocityX *= 0.22;
      state.velocityY *= 0.22;
      state.velocityScale *= 0.22;
      state.velocityRotation *= 0.22;
    }

    if (reducedMotion && projectStack.classList.contains("layers-physics")) {
      state.x = state.targetX;
      state.y = state.targetY;
      state.scale = state.targetScale;
      state.rotation = state.targetRotation;
      state.velocityX = 0;
      state.velocityY = 0;
      state.velocityScale = 0;
      state.velocityRotation = 0;
    }
  });

  if (reducedMotion) applyLayerMotion();
  else requestLayerMotion();
};

if (projectStack && layerCards.length) {
  setActiveLayer(2, { lift: false });

  const unfoldLayers = () => {
    if (projectStack.classList.contains("layers-staged")) return;
    projectStack.classList.add("layers-staged");

    if (isMobileProjectMode()) {
      projectStack.classList.add("layers-unfolded", "layers-ready");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      projectStack.classList.add("layers-unfolded", "layers-ready");
      enableLayerPhysics();
      return;
    }

    window.setTimeout(() => projectStack.classList.add("layers-unfolded"), 520);
    window.setTimeout(() => {
      projectStack.classList.add("layers-ready");
      enableLayerPhysics();
    }, 1650);
  };

  const layerIntroObserver = new IntersectionObserver(
    (entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      unfoldLayers();
      observer.disconnect();
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -8% 0px",
    }
  );
  layerIntroObserver.observe(projectStack);

  layerCards.forEach((card, index) => {
    card.addEventListener("pointerdown", () => {
      if (!usesCoarseLayerPointer() || isMobileProjectMode()) return;
      card.dataset.tapStartedActive = String(activeLayerIndex === index);
      if (activeLayerIndex !== index) setActiveLayer(index);
    }, { capture: true });
    card.addEventListener("click", (event) => {
      if (!usesCoarseLayerPointer() || isMobileProjectMode()) return;
      if (event.detail === 0) return;
      const startedActive = card.dataset.tapStartedActive === "true";
      delete card.dataset.tapStartedActive;
      if (startedActive) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, { capture: true });
    card.addEventListener("focus", () => {
      if (!isMobileProjectMode()) setActiveLayer(index);
    });
  });

  const settleLayerPointerInfluence = () => {
    layerMotion.forEach((state) => {
      state.targetX = state.layoutX;
      state.targetY = state.layoutY;
      state.targetScale = state.layoutScale;
      state.targetRotation = state.layoutRotation;
    });
    requestLayerMotion();
  };

  const applyLayerPointerInfluence = (pointerRatio, pointerY, centerY, cardHeight, positions) => {
    const activePosition = positions[activeLayerIndex];
    const horizontalRange = window.innerWidth <= 860 ? 0.11 : 0.13;
    const pointerX = Math.max(-1, Math.min(1, (pointerRatio - activePosition) / horizontalRange));
    const pointerVertical = Math.max(-1, Math.min(1, (pointerY - centerY) / Math.max(1, cardHeight * 0.5)));

    layerMotion.forEach((state, index) => {
      const distance = Math.abs(index - activeLayerIndex);
      const connection = distance === 0 ? 1 : 0.18 / distance;
      state.targetX = state.layoutX + pointerX * 3 * connection;
      state.targetY = state.layoutY + pointerVertical * 2 * connection;
      state.targetScale = state.layoutScale;
    });
    requestLayerMotion();
  };

  const selectLayerFromPointer = () => {
    layerHoverFrame = 0;
    if (!pendingLayerPointer || usesCoarseLayerPointer() || !projectStack.classList.contains("layers-ready")) return;

    const rect = projectStack.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const cardHeight = layerCards[2]?.offsetHeight || rect.height * 0.7;
    if (Math.abs(pendingLayerPointer.y - centerY) > cardHeight * 0.6) {
      settleLayerPointerInfluence();
      return;
    }

    const positions = window.innerWidth <= 860
      ? [-0.22, -0.11, 0, 0.11, 0.22]
      : [-0.27, -0.14, 0, 0.14, 0.27];
    const pointerRatio = (pendingLayerPointer.x - rect.left) / Math.max(1, rect.width) - 0.5;
    let candidate = activeLayerIndex;
    let candidateDistance = Number.POSITIVE_INFINITY;

    positions.forEach((position, index) => {
      const distance = Math.abs(pointerRatio - position);
      if (distance < candidateDistance) {
        candidate = index;
        candidateDistance = distance;
      }
    });

    const activeDistance = Math.abs(pointerRatio - positions[activeLayerIndex]);
    if (candidate !== activeLayerIndex && candidateDistance + 0.018 < activeDistance) {
      setActiveLayer(candidate);
    } else if (candidate === activeLayerIndex && !layerIsLifted) {
      setActiveLayer(activeLayerIndex);
    }

    applyLayerPointerInfluence(
      pointerRatio,
      pendingLayerPointer.y,
      centerY,
      cardHeight,
      positions
    );
  };

  projectStack.addEventListener("pointermove", (event) => {
    if (usesCoarseLayerPointer() || isMobileProjectMode()) return;
    pendingLayerPointer = {
      x: event.clientX,
      y: event.clientY,
    };
    if (!layerHoverFrame) layerHoverFrame = requestAnimationFrame(selectLayerFromPointer);
  }, { passive: true });

  projectStack.addEventListener("pointerleave", () => {
    if (usesCoarseLayerPointer() || isMobileProjectMode()) return;
    pendingLayerPointer = null;
    if (layerHoverFrame) cancelAnimationFrame(layerHoverFrame);
    layerHoverFrame = 0;
    setActiveLayer(2, { lift: false });
  });

}

let mobileProjectActiveIndex = 2;
let mobileProjectVisualFrame = 0;

const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

const mobileProjectMaxScroll = () => Math.max(0, projectStack.scrollWidth - projectStack.clientWidth);

const mobileProjectTarget = (card) => clampValue(
  card.offsetLeft - (projectStack.clientWidth - card.offsetWidth) / 2,
  0,
  mobileProjectMaxScroll()
);

const updateMobileProjectDots = (index) => {
  mobileProjectActiveIndex = index;
  if (!projectSnapDots) return;

  Array.from(projectSnapDots.children).forEach((dot, dotIndex) => {
    const active = dotIndex === index;
    dot.classList.toggle("active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
};

const updateMobileProjectVisuals = () => {
  mobileProjectVisualFrame = 0;
  if (!projectStack || !isMobileProjectMode()) return;

  const viewportCenter = projectStack.scrollLeft + projectStack.clientWidth / 2;
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  layerCards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = clampValue((cardCenter - viewportCenter) / projectStack.clientWidth, -1, 1);
    const absoluteDistance = Math.abs(cardCenter - viewportCenter);
    card.style.setProperty("--mobile-distance", distance.toFixed(4));
    card.style.setProperty("--mobile-abs-distance", Math.abs(distance).toFixed(4));
    card.style.setProperty("--mobile-lean", "0deg");

    if (absoluteDistance < nearestDistance) {
      nearest = index;
      nearestDistance = absoluteDistance;
    }
  });

  layerCards.forEach((card, index) => {
    const active = index === nearest;
    card.classList.toggle("is-layer-active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
  });
  updateMobileProjectDots(nearest);
};

const requestMobileProjectVisuals = () => {
  if (mobileProjectVisualFrame) return;
  mobileProjectVisualFrame = requestAnimationFrame(updateMobileProjectVisuals);
};

const scrollMobileProjectTo = (index, behavior = "smooth") => {
  if (!projectStack || !isMobileProjectMode()) return;
  const target = mobileProjectTarget(layerCards[index]);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  projectStack.scrollTo({
    left: target,
    behavior: reducedMotion ? "auto" : behavior,
  });
  updateMobileProjectDots(index);
  requestMobileProjectVisuals();
};

if (projectStack && layerCards.length && projectSnapDots) {
  layerCards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show project ${index + 1}`);
    dot.addEventListener("click", () => scrollMobileProjectTo(index));
    projectSnapDots.appendChild(dot);
  });
  projectStack.addEventListener("scroll", requestMobileProjectVisuals, { passive: true });

  const configureMobileProjects = () => {
    if (isMobileProjectMode()) {
      projectStack.classList.add("mobile-project-carousel", "layers-staged", "layers-unfolded", "layers-ready");
      requestAnimationFrame(() => scrollMobileProjectTo(mobileProjectActiveIndex, "auto"));
      return;
    }

    projectStack.classList.remove("mobile-project-carousel");
    projectStack.scrollLeft = 0;
    layerCards.forEach((card) => {
      card.style.removeProperty("--mobile-distance");
      card.style.removeProperty("--mobile-abs-distance");
      card.style.removeProperty("--mobile-lean");
    });
    setActiveLayer(2, { lift: false });
  };

  mobileProjectMedia.addEventListener?.("change", configureMobileProjects);
  configureMobileProjects();
}

let lastDetailTrigger = null;

const openDetail = (card) => {
  if (!detailView || !detailImage || !detailLabel || !detailTitle || !detailCopy) return;

  lastDetailTrigger = card;
  detailView.classList.remove("marihacks-detail", "optimath-detail", "speedcube-detail");
  if (card.dataset.detailClass) detailView.classList.add(card.dataset.detailClass);
  detailImage.src = card.dataset.detailImage || "";
  detailImage.alt = card.querySelector("img")?.alt || card.dataset.detailTitle || "";
  detailLabel.textContent = card.dataset.detailLabel || "";
  if (card.dataset.detailTitle === "Montreal competitions") {
    detailTitle.innerHTML = '<span>Montreal</span><span class="detail-title-competition">competitions</span>';
  } else {
    detailTitle.textContent = card.dataset.detailTitle || "";
  }
  detailCopy.textContent = card.dataset.detailCopy || "";
  detailView.classList.add("open");
  detailView.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-open");
};

const closeDetail = () => {
  if (!detailView) return;

  detailView.classList.remove("open");
  detailView.classList.remove("marihacks-detail", "optimath-detail", "speedcube-detail");
  detailView.setAttribute("aria-hidden", "true");
  document.body.classList.remove("detail-open");
  lastDetailTrigger?.focus();
};

detailCards.forEach((card) => {
  card.addEventListener("click", () => {
    openDetail(card);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail(card);
    }
  });
});

detailView?.addEventListener("click", (event) => {
  if (event.target === detailView) closeDetail();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && detailView?.classList.contains("open")) closeDetail();
});

let scrollFrame = 0;
const requestScrollUpdate = () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScroll();
  });
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  updateMobileHeroLayout();
  updateChapterTravel();
  requestScrollUpdate();
  if (projectStack && isMobileProjectMode()) {
    requestAnimationFrame(() => scrollMobileProjectTo(mobileProjectActiveIndex, "auto"));
  } else if (projectStack) {
    setActiveLayer(activeLayerIndex, { lift: layerIsLifted });
  }
  if (!highlightBlocks.length) return;
  window.clearTimeout(highlightResizeTimer);
  highlightResizeTimer = window.setTimeout(() => {
    highlightBlocks.forEach(splitHighlightLines);
    updateHighlights();
  }, 120);
});
highlightBlocks.forEach(splitHighlightLines);
updateMobileHeroLayout();
updateChapterTravel();
document.fonts?.ready.then(() => {
  updateMobileHeroLayout();
  updateChapterTravel();
});
updateScroll();

let activeStoryWindow = null;
const lensRadius = 112;
const trailState = new WeakMap();

const setStoryLens = (windowEl, x, y) => {
  windowEl.style.setProperty("--mx", `${x.toFixed(2)}px`);
  windowEl.style.setProperty("--my", `${y.toFixed(2)}px`);
};

const getTrailState = (windowEl) => {
  let state = trailState.get(windowEl);
  if (state) return state;

  const canvas = document.createElement("canvas");
  canvas.className = "reveal-canvas";
  canvas.setAttribute("aria-hidden", "true");
  windowEl.appendChild(canvas);

  const mask = document.createElement("canvas");

  state = {
    canvas,
    context: canvas.getContext("2d"),
    mask,
    maskContext: mask.getContext("2d"),
    sourceImage: windowEl.querySelector(":scope > img"),
    lastX: Number.NaN,
    lastY: Number.NaN,
    lastBrush: 82,
    lastTime: 0,
    strokes: [],
    animating: false,
    width: 0,
    height: 0,
  };
  trailState.set(windowEl, state);
  return state;
};

const resizeTrailCanvas = (windowEl, state) => {
  const rect = windowEl.getBoundingClientRect();
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(rect.width * scale));
  const height = Math.max(1, Math.round(rect.height * scale));

  if (state.width === width && state.height === height) return { rect, scale };

  state.width = width;
  state.height = height;
  state.canvas.width = width;
  state.canvas.height = height;
  state.mask.width = width;
  state.mask.height = height;
  state.canvas.style.width = `${rect.width}px`;
  state.canvas.style.height = `${rect.height}px`;
  return { rect, scale };
};

const getObjectPosition = (image) => {
  const [rawX = "50%", rawY = "50%"] = getComputedStyle(image).objectPosition.split(" ");
  const parse = (value) => {
    if (value.endsWith("%")) return Number.parseFloat(value) / 100;
    return 0.5;
  };
  return { x: parse(rawX), y: parse(rawY) };
};

const drawImageCover = (context, image, width, height) => {
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return;

  const position = getObjectPosition(image);
  const zoom = 1.02;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) * position.x;
  const y = (height - drawHeight) * position.y;
  context.drawImage(image, x, y, drawWidth, drawHeight);
};

const drawTrailMask = (state, now = performance.now()) => {
  const { maskContext, width, height, strokes } = state;
  if (!maskContext || !width || !height) return;

  maskContext.clearRect(0, 0, width, height);
  maskContext.save();
  maskContext.globalCompositeOperation = "source-over";
  maskContext.strokeStyle = "rgba(255, 255, 255, 1)";
  maskContext.fillStyle = "rgba(255, 255, 255, 1)";
  maskContext.lineCap = "round";
  maskContext.lineJoin = "round";

  state.strokes = strokes.filter((stroke) => now - stroke.created < stroke.life);

  state.strokes.forEach((stroke) => {
    const age = Math.min(1, Math.max(0, (now - stroke.created) / stroke.life));
    const ease = 1 - age * age * (3 - 2 * age);
    const widthNow = Math.max(0, stroke.width * ease);
    if (widthNow < 1) return;

    maskContext.lineWidth = widthNow;
    maskContext.beginPath();
    maskContext.moveTo(stroke.x1, stroke.y1);
    maskContext.quadraticCurveTo(stroke.cx, stroke.cy, stroke.x2, stroke.y2);
    maskContext.stroke();
  });

  maskContext.restore();
};

const renderTrail = (state, now = performance.now()) => {
  const { context, maskContext, sourceImage, width, height } = state;
  if (!context || !maskContext || !sourceImage || !width || !height) return;

  drawTrailMask(state, now);
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = "source-over";
  drawImageCover(context, sourceImage, width, height);
  context.globalCompositeOperation = "destination-in";
  context.drawImage(state.mask, 0, 0);
  context.globalCompositeOperation = "source-over";
};

const animateTrail = (state) => {
  if (state.animating) return;
  state.animating = true;
  const step = () => {
    renderTrail(state);
    if (!state.strokes.length && Number.isNaN(state.lastX)) {
      renderTrail(state);
      state.animating = false;
      return;
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const addTrailStroke = (windowEl, x, y, force = false) => {
  const state = getTrailState(windowEl);
  const now = performance.now();
  const { scale } = resizeTrailCanvas(windowEl, state);
  const sx = x * scale;
  const sy = y * scale;
  const distance = Number.isNaN(state.lastX) ? Number.POSITIVE_INFINITY : Math.hypot(sx - state.lastX, sy - state.lastY);

  if (!force && distance < 9 * scale && now - state.lastTime < 14) return;

  const isDesktop = window.matchMedia("(pointer: fine)").matches;
  const speed = Number.isFinite(distance) ? Math.min(1, distance / (165 * scale)) : 0.18;
  const baseBrush = isDesktop ? 122 : 102;
  const speedBoost = isDesktop ? 70 : 54;
  const targetBrush = (baseBrush + speed * speedBoost) * scale;
  const brush = force ? targetBrush : state.lastBrush + (targetBrush - state.lastBrush) * 0.42;

  if (Number.isNaN(state.lastX)) {
    state.strokes.push({
      x1: sx - 0.01,
      y1: sy,
      cx: sx,
      cy: sy,
      x2: sx + 0.01,
      y2: sy,
      width: brush * 0.78,
      created: now,
      life: 960,
    });
  } else {
    const dx = sx - state.lastX;
    const dy = sy - state.lastY;
    const curvePull = Math.min(28 * scale, distance * 0.18);
    const normal = Math.hypot(dx, dy) || 1;
    const curve = Math.sin(now * 0.018) * curvePull;
    const cx = (state.lastX + sx) / 2 - (dy / normal) * curve;
    const cy = (state.lastY + sy) / 2 + (dx / normal) * curve;

    state.strokes.push({
      x1: state.lastX,
      y1: state.lastY,
      cx,
      cy,
      x2: sx,
      y2: sy,
      width: brush,
      created: now,
      life: 1280 + speed * 420,
    });
  }
  while (state.strokes.length > 42) state.strokes.shift();
  renderTrail(state);

  state.lastX = sx;
  state.lastY = sy;
  state.lastBrush = brush;
  state.lastTime = now;
  animateTrail(state);
};

const revealStoryWindow = (windowEl, clientX, clientY, forceSpot = false) => {
  if (activeStoryWindow && activeStoryWindow !== windowEl) {
    activeStoryWindow.classList.remove("revealing");
  }

  activeStoryWindow = windowEl;
  activeStoryWindow.classList.add("revealing");
  const rect = windowEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  setStoryLens(windowEl, x, y);
  addTrailStroke(windowEl, x, y, forceSpot);
};

const clearStoryReveal = () => {
  if (!activeStoryWindow) return;
  activeStoryWindow.classList.remove("revealing");
  const state = trailState.get(activeStoryWindow);
  if (state) {
    state.lastX = Number.NaN;
    state.lastY = Number.NaN;
    state.lastBrush = 82;
    state.lastTime = 0;
    animateTrail(state);
  }
  activeStoryWindow = null;
};

const getStoryWindowInLens = (clientX, clientY) => {
  let closestWindow = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  storyWindows.forEach((windowEl) => {
    const rect = windowEl.getBoundingClientRect();
    const nearestX = Math.max(rect.left, Math.min(clientX, rect.right));
    const nearestY = Math.max(rect.top, Math.min(clientY, rect.bottom));
    const distance = Math.hypot(clientX - nearestX, clientY - nearestY);

    if (distance <= lensRadius && distance < closestDistance) {
      closestWindow = windowEl;
      closestDistance = distance;
    }
  });

  return closestWindow;
};

window.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--bgx", `${event.clientX}px`);
  document.documentElement.style.setProperty("--bgy", `${event.clientY}px`);

  const windowInLens = getStoryWindowInLens(event.clientX, event.clientY);
  if (windowInLens) {
    revealStoryWindow(windowInLens, event.clientX, event.clientY);
    return;
  }

  clearStoryReveal();
}, { passive: true });

const applyReactiveMotion = (target, event) => {
  const rect = target.getBoundingClientRect();
  const x = (event.clientX - rect.left) / Math.max(1, rect.width);
  const y = (event.clientY - rect.top) / Math.max(1, rect.height);
  const dx = x - 0.5;
  const dy = y - 0.5;
  const strength = target.classList.contains("skill-group") ? 2.2 : target.classList.contains("education-panel") ? 4 : 2.6;

  target.style.setProperty("--tilt-x", `${(dx * strength).toFixed(2)}deg`);
  target.style.setProperty("--tilt-y", `${(-dy * strength).toFixed(2)}deg`);
  target.style.setProperty("--repel-x", `${(dx * 2).toFixed(2)}px`);
  target.style.setProperty("--repel-y", `${(dy * 2).toFixed(2)}px`);
  target.style.setProperty("--card-x", `${(x * 100).toFixed(1)}%`);
  target.style.setProperty("--card-y", `${(y * 100).toFixed(1)}%`);
};

if (window.matchMedia("(pointer: fine)").matches) {
  reactiveItems.forEach((target) => {
    target.addEventListener("pointermove", (event) => applyReactiveMotion(target, event), { passive: true });
    target.addEventListener("pointerleave", () => {
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      target.style.setProperty("--repel-x", "0px");
      target.style.setProperty("--repel-y", "0px");
    });
  });
}

window.addEventListener("pointerup", clearStoryReveal, { passive: true });
window.addEventListener("pointercancel", clearStoryReveal, { passive: true });

storyWindows.forEach((windowEl) => {
  const activateWindow = (event, forceSpot = false) => {
    revealStoryWindow(windowEl, event.clientX, event.clientY, forceSpot);
  };

  windowEl.addEventListener("pointerdown", (event) => {
    windowEl.setPointerCapture?.(event.pointerId);
    activateWindow(event, true);
  });
  windowEl.addEventListener("pointermove", activateWindow);
  windowEl.addEventListener("pointerenter", (event) => activateWindow(event, true));
  windowEl.addEventListener("pointerup", clearStoryReveal);
  windowEl.addEventListener("pointercancel", clearStoryReveal);
});
