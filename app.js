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
      start: "top 80%",
    }
  })
})

// Social Share Functions
function shareFacebook() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: 'MISSING: Batman (Black Cat)',
      text: 'We ask you nicely: if you have accidentally taken Batman, please bring him back to us. We promise that we will not ask any questions if you return him safely. However, if you choose not to return him, we beg you to please take good care of him. He was born at our home and is very dear to us. Please have mercy towards the owners who raised him and love him. His safety and health are all that matter to us.',
      url: url
    }).catch(err => {
      // If user cancels or share fails, fallback to web
      console.log('Share failed or canceled', err);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });
  } else {
    // Fallback for desktop or unsupported browsers
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }
}

function shareWhatsApp() {
  const text = encodeURIComponent(`Help find Batman, a missing black cat! ${window.location.href}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copy-text');
    const original = btn.innerText;
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = original, 2000);
  });
}

// Generate Poster Function
function generatePoster() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // A4 size at ~100 DPI (approx 800x1131)
  canvas.width = 800;
  canvas.height = 1131;
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Header
  ctx.fillStyle = '#ff3b30';
  ctx.font = 'bold 80px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MISSING CAT', canvas.width / 2, 80);
  
  // Subheader
  ctx.fillStyle = '#000000';
  ctx.font = '30px Inter, sans-serif';
  ctx.fillText('Have you seen Batman?', canvas.width / 2, 140);
  
  // Image
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    // Aspect fit
    const h = 500;
    const w = (img.width / img.height) * h;
    ctx.drawImage(img, (canvas.width - w) / 2, 180, w, h);
    
    // Details
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    const startX = 100;
    let startY = 740;
    
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText('Name:', startX, startY);
    ctx.font = '30px Inter, sans-serif';
    ctx.fillText('Batman (Black Cat)', startX + 160, startY);
    
    startY += 50;
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText('Missing:', startX, startY);
    ctx.font = '30px Inter, sans-serif';
    ctx.fillText('23 January 2026', startX + 160, startY);
    
    startY += 50;
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText('Location:', startX, startY);
    ctx.font = '30px Inter, sans-serif';
    ctx.fillText('Taman Antarabangsa, Likas', startX + 160, startY);
    
    // Contact Box
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(0, 930, canvas.width, 201);
    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillText('IF FOUND PLEASE CALL', canvas.width / 2, 1000);
    ctx.font = 'bold 70px Inter, sans-serif';
    ctx.fillText('+60 14-319 2305', canvas.width / 2, 1080);
    
    // Download
    const link = document.createElement('a');
    link.download = 'missing-batman-poster.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };
  img.src = 'batman-2.jpg';
}

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
