// Atlas — Landing page micro-interactions

document.addEventListener("DOMContentLoaded", () => {
  // Animate the hero phone bubbles
  const bubbles = document.querySelectorAll(".phone-chat .bubble");
  bubbles.forEach((b, i) => {
    b.style.opacity = "0";
    b.style.transform = "translateY(8px)";
    setTimeout(() => {
      b.style.transition = "all 0.4s ease";
      b.style.opacity = "1";
      b.style.transform = "translateY(0)";
    }, 200 + i * 350);
  });

  // Animate the stat row numbers
  const statNums = document.querySelectorAll(".stat .num");
  statNums.forEach((el) => {
    const original = el.textContent;
    el.textContent = "—";
    setTimeout(() => { el.textContent = original; }, 600);
  });
});
