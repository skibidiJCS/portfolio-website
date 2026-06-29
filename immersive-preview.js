const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const cloudStudy = document.querySelector(".cloud-study");
const projectDepth = document.querySelector(".project-depth");
const counterStudy = document.querySelector(".counter-study");

const progressFor = (section) => {
  const rect = section.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  return clamp(-rect.top / travel);
};

let frame = 0;
const update = () => {
  frame = 0;
  if (cloudStudy) cloudStudy.style.setProperty("--cloud-progress", progressFor(cloudStudy).toFixed(4));
  if (projectDepth) projectDepth.style.setProperty("--depth-progress", progressFor(projectDepth).toFixed(4));
};

const requestUpdate = () => {
  if (frame) return;
  frame = requestAnimationFrame(update);
};

document.querySelectorAll(".counter-card").forEach((card) => {
  const year = card.dataset.year || "2025";
  const target = card.querySelector(".counter-year");
  year.split("").forEach((digit, index) => {
    const reel = document.createElement("span");
    reel.className = "digit-reel";
    const track = document.createElement("span");
    track.className = "digit-track";
    track.style.setProperty("--digit-shift", `${Number(digit) * -0.85}em`);
    track.style.setProperty("--digit-delay", `${index * 85}ms`);
    for (let number = 0; number <= 9; number += 1) {
      const item = document.createElement("i");
      item.textContent = number;
      track.appendChild(item);
    }
    reel.appendChild(track);
    target.appendChild(reel);
  });
});

if (counterStudy) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      counterStudy.classList.add("counter-visible");
      observer.disconnect();
    },
    { threshold: 0.35 }
  );
  observer.observe(counterStudy);
}

addEventListener("scroll", requestUpdate, { passive: true });
addEventListener("resize", requestUpdate);
update();
