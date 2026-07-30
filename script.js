document.addEventListener('DOMContentLoaded', () => {
  // Copyright Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // --- MOBILE MENU ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.getElementById('navbar');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.textContent = '☰';
      });
    });
  }

  // --- THEME TOGGLE ---
  const themeToggle = document.getElementById('theme-toggle');
  const iconMoon = document.querySelector('.icon-moon');
  const iconSun = document.querySelector('.icon-sun');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
    } else {
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
    }
  }

  // --- COUNTER ANIMATION ---
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);
      
      el.textContent = current + '+';
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  };

  // --- INTERSECTION OBSERVER FOR ANIMATIONS ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Trigger counter animation for stats
        if (entry.target.querySelector('.stat-number')) {
          entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll('.section, .hero-content').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- SCROLL EFFECTS (navbar + subtle parallax, single listener) ---
  const heroContent = document.querySelector('.hero-content');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (heroContent) {
      const rate = currentScroll * 0.3;
      heroContent.style.transform = `translateY(${rate}px)`;
      heroContent.style.opacity = 1 - (currentScroll / 800);
    }
  });

  // --- VISITOR COUNTER (via Supabase) ---
  async function loadVisitorCount() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    // Pastikan koneksi Supabase (db) udah siap
    if (typeof db === 'undefined') {
      countEl.textContent = '—';
      console.warn('Supabase (db) belum siap, counter dilewati.');
      return;
    }

    try {
      // Panggil fungsi increment_visits() yang kita bikin di database.
      // Tiap dipanggil: nambah +1, terus balikin angka terbaru.
      const { data, error } = await db.rpc('increment_visits');
      if (error) throw error;

      countEl.textContent = Number(data).toLocaleString();
    } catch (error) {
      // Kalau gagal, tampilkan strip biar ga nampilin angka palsu
      countEl.textContent = '—';
      console.error('Visitor counter error:', error);
    }
  }

  loadVisitorCount();
});
