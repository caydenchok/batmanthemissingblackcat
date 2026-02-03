const year = document.getElementById("year")
if (year) year.textContent = new Date().getFullYear()

// Canvas Starfield
const canvas = document.getElementById("starfield")
if (canvas) {
  const ctx = canvas.getContext("2d")
  let w = 0, h = 0, stars = []
  function resize() {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener("resize", resize)
  function makeStars() {
    stars = Array.from({ length: Math.max(240, Math.floor(w * h / 8000)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.2,
      a: Math.random() * 0.6 + 0.2,
      v: Math.random() * 0.2 + 0.05
    }))
  }
  makeStars()
  let t0 = performance.now()
  function loop(t) {
    const dt = Math.min(0.05, (t - t0) / 1000)
    t0 = t
    ctx.clearRect(0, 0, w, h)
    for (let s of stars) {
      s.a += (Math.random() - 0.5) * 0.02
      s.x += s.v * 0.6
      if (s.x > w) s.x = 0
      if (s.a < 0.2) s.a = 0.2
      if (s.a > 0.8) s.a = 0.8
      ctx.globalAlpha = s.a
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = "#ffcc00"
      ctx.fill()
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

gsap.registerPlugin(ScrollTrigger)

gsap.from(".hero-content", {
  y: 24,
  opacity: 0,
  duration: 1.2,
  ease: "power3.out"
})

gsap.to(".tail", {
  rotate: 5,
  yoyo: true,
  repeat: -1,
  transformOrigin: "290px 380px",
  duration: 3,
  ease: "sine.inOut"
})

const eyesTl = gsap.timeline({ repeat: -1, repeatDelay: 3.5 })
eyesTl.to([".eye", ".pupil"], { scaleY: 0.1, duration: 0.1, transformOrigin: "center", ease: "power2.inOut" })
eyesTl.to([".eye", ".pupil"], { scaleY: 1, duration: 0.15, transformOrigin: "center", ease: "power2.inOut" })

gsap.utils.toArray(".panel").forEach((panel, i) => {
  const inner = panel.querySelector(".panel-inner")
  gsap.to(panel, {
    backgroundPosition: "0px 60px",
    ease: "none",
    scrollTrigger: {
      trigger: panel,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  })
  gsap.from(inner, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: panel,
      start: "top 70%",
      toggleActions: "play none none reverse"
    }
  })
})

gsap.utils.toArray(".detail-grid").forEach(grid => {
  gsap.from(grid.children, {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: grid,
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  })
})

// Photo Slider Logic
const slider = document.querySelector('.slider-container');
const slidesWrapper = document.querySelector('.slides-wrapper');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
const dotsContainer = document.querySelector('.slider-dots');

let currentSlide = 0;
const totalSlides = slides.length;
let autoSlideInterval;

// Create dots
slides.forEach((_, index) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (index === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(index));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = index;
  if (currentSlide < 0) currentSlide = totalSlides - 1;
  if (currentSlide >= totalSlides) currentSlide = 0;
  
  slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
  updateDots();
  resetAutoSlide();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// Initial start
startAutoSlide();

// Pause on hover
slider.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
slider.addEventListener('mouseleave', startAutoSlide);

// Animation for slider container appearance
gsap.from(".slider-container", {
  y: 40,
  opacity: 0,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".slider-container",
    start: "top 80%",
    toggleActions: "play none none reverse"
  }
});

const heroCat = document.querySelector(".cat-wrap")
gsap.to(heroCat, {
  y: 12,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
})

const form = document.getElementById("contact-form")
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault()
    const data = new FormData(form)
    const name = data.get("name")
    const message = data.get("message")
    alert("Thanks. We will reach out.")
    form.reset()
  })
}
