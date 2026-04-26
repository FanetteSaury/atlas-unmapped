// Atlas — Pitch deck navigation
// Arrow keys, dot indicators, F for fullscreen.

(function () {
  "use strict";
  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".deck-nav .dot"));

  let currentIndex = 0;

  function goTo(i) {
    if (i < 0 || i >= slides.length) return;
    currentIndex = i;
    slides[i].scrollIntoView({ behavior: "smooth", block: "start" });
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  }

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault(); goTo(currentIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
      e.preventDefault(); goTo(currentIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault(); goTo(0);
    } else if (e.key === "End") {
      e.preventDefault(); goTo(slides.length - 1);
    } else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    } else if (/^[1-5]$/.test(e.key)) {
      goTo(parseInt(e.key) - 1);
    }
  });

  // Dot navigation
  dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

  // Update active dot on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting && en.intersectionRatio > 0.5) {
        const idx = slides.indexOf(en.target);
        if (idx !== -1) {
          currentIndex = idx;
          dots.forEach((d, i) => d.classList.toggle("active", i === idx));
        }
      }
    });
  }, { threshold: [0.5] });
  slides.forEach(s => observer.observe(s));
})();
