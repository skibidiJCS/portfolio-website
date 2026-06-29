const viewport = document.querySelector(".drag-viewport");
const cards = Array.from(document.querySelectorAll(".drag-card"));
const dots = document.querySelector(".snap-dots");

let activeIndex = 2;
let dragging = false;
let pointerId = null;
let startX = 0;
let startScroll = 0;
let lastX = 0;
let lastTime = 0;
let dragVelocity = 0;
let animationFrame = 0;
let visualFrame = 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const targetForCard = (card) => (
  card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2
);

const nearestIndex = (predictedScroll) => {
  let nearest = 0;
  let distance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const nextDistance = Math.abs(targetForCard(card) - predictedScroll);
    if (nextDistance < distance) {
      nearest = index;
      distance = nextDistance;
    }
  });

  return nearest;
};

const updateDots = (index) => {
  activeIndex = index;
  Array.from(dots.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
  });
};

const updateCardVisuals = () => {
  visualFrame = 0;
  const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
  const lean = clamp(dragVelocity * -0.018, -2.2, 2.2);
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = clamp((cardCenter - viewportCenter) / viewport.clientWidth, -1, 1);
    const absoluteDistance = Math.abs(cardCenter - viewportCenter);
    card.style.setProperty("--distance", distance.toFixed(4));
    card.style.setProperty("--abs-distance", Math.abs(distance).toFixed(4));
    card.style.setProperty("--velocity-lean", `${lean.toFixed(3)}deg`);

    if (absoluteDistance < nearestDistance) {
      nearest = index;
      nearestDistance = absoluteDistance;
    }
  });

  updateDots(nearest);
};

const requestVisualUpdate = () => {
  if (visualFrame) return;
  visualFrame = requestAnimationFrame(updateCardVisuals);
};

const stopAnimation = () => {
  if (!animationFrame) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  viewport.classList.remove("is-animating");
};

const springTo = (index, releaseVelocity = 0) => {
  stopAnimation();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = targetForCard(cards[index]);

  if (reducedMotion) {
    viewport.scrollLeft = target;
    dragVelocity = 0;
    viewport.classList.remove("is-animating");
    requestVisualUpdate();
    return;
  }

  viewport.classList.add("is-animating");

  let position = viewport.scrollLeft;
  let velocity = clamp(releaseVelocity, -2300, 2300);
  let previousTime = performance.now();

  const step = (time) => {
    const delta = Math.min(0.032, Math.max(0.008, (time - previousTime) / 1000));
    const acceleration = (target - position) * 170 - velocity * 24;
    velocity += acceleration * delta;
    position += velocity * delta;
    viewport.scrollLeft = position;
    dragVelocity = velocity / 1000;
    requestVisualUpdate();
    previousTime = time;

    if (Math.abs(target - position) < 0.3 && Math.abs(velocity) < 8) {
      viewport.scrollLeft = target;
      dragVelocity = 0;
      animationFrame = 0;
      viewport.classList.remove("is-animating");
      updateDots(index);
      requestVisualUpdate();
      return;
    }

    animationFrame = requestAnimationFrame(step);
  };

  animationFrame = requestAnimationFrame(step);
};

cards.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show project ${index + 1}`);
  dot.addEventListener("click", () => springTo(index));
  dots.appendChild(dot);
});

viewport.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  stopAnimation();
  dragging = true;
  pointerId = event.pointerId;
  startX = event.clientX;
  startScroll = viewport.scrollLeft;
  lastX = event.clientX;
  lastTime = event.timeStamp || performance.now();
  dragVelocity = 0;
  viewport.classList.add("is-dragging");
  viewport.setPointerCapture?.(event.pointerId);
});

viewport.addEventListener("pointermove", (event) => {
  if (!dragging || event.pointerId !== pointerId) return;
  const time = event.timeStamp || performance.now();
  const elapsed = Math.max(8, time - lastTime);
  const pointerVelocity = ((lastX - event.clientX) / elapsed);
  dragVelocity = dragVelocity * 0.62 + pointerVelocity * 0.38;
  viewport.scrollLeft = startScroll + (startX - event.clientX);
  lastX = event.clientX;
  lastTime = time;
  requestVisualUpdate();
});

const releaseDrag = (event) => {
  if (!dragging || event.pointerId !== pointerId) return;
  dragging = false;
  viewport.classList.remove("is-dragging");
  viewport.releasePointerCapture?.(event.pointerId);

  const predicted = viewport.scrollLeft + dragVelocity * 240;
  const nextIndex = nearestIndex(predicted);
  springTo(nextIndex, dragVelocity * 1000);
  pointerId = null;
};

viewport.addEventListener("pointerup", releaseDrag);
viewport.addEventListener("pointercancel", releaseDrag);
viewport.addEventListener("scroll", requestVisualUpdate, { passive: true });

window.addEventListener("resize", () => {
  viewport.scrollLeft = targetForCard(cards[activeIndex]);
  requestVisualUpdate();
});

requestAnimationFrame(() => {
  viewport.scrollLeft = targetForCard(cards[activeIndex]);
  updateCardVisuals();
});
