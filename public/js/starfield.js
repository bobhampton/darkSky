let canvas, ctx, stars = [];
let starAnimationId;

export function initStarfield() {
  canvas = document.getElementById('starfield');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();

  const toggle = document.getElementById('starfieldToggle');
  if (toggle) {
    let enabled = localStorage.getItem('EnableStarfield');
    if (enabled === null) {
      enabled = 'true';
      localStorage.setItem('EnableStarfield', enabled);
    }
    const enabledBool = enabled === 'true';
    toggle.checked = enabledBool;
    applyStarfieldToggle(enabledBool);

    toggle.addEventListener('change', () => {
      const checked = toggle.checked;
      localStorage.setItem('EnableStarfield', checked);
      applyStarfieldToggle(checked);
    });
  }

  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function generateStars() {
  stars = [];
  const numStars = 120;
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    });
  }
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.x += star.dx;
    star.y += star.dy;
    if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
    if (star.y < 0 || star.y > canvas.height) star.dy *= -1;
  });

  starAnimationId = requestAnimationFrame(animateStars);
}

function applyStarfieldToggle(checked) {
  if (!canvas || !ctx) return;

  if (checked) {
    canvas.style.display = 'block';
    resizeCanvas();
    generateStars();
    animateStars();
  } else {
    canvas.style.display = 'none';
    cancelAnimationFrame(starAnimationId);
  }
}
