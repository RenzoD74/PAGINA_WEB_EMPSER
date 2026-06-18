/* ============================================================
   EMPSER S.A.C. — JavaScript Principal
   ============================================================ */

/* ---- CONFIGURACIÓN GLOBAL ---- */
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxxk_2a3wvT3gAVyCxjWy_kTudCwXwc62IhMjMeERLzkKtyWhyQPFIK0vt-4hlZNTHG/exec',
  WHATSAPP_NUM: '51958909461',
  FACEBOOK_URL: 'https://facebook.com/empser',
  INSTAGRAM_URL: 'https://instagram.com/empser',
  LINKEDIN_URL: 'https://linkedin.com/company/empser',
  CORREO: 'A.HUAMAN@EMPSERSAC.COM',
  DIRECCION: 'Lima, Perú',
  MAPS_EMBED: '',
};

/* ---- NAVBAR ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
  }

  // Active link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  // Close menu on link click
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger && hamburger.classList.remove('active');
    });
  });
}

/* ---- HERO SLIDER ---- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    timer = setInterval(next, 5500);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startTimer();
    });
  });

  slides[0].classList.add('active');
  dots[0] && dots[0].classList.add('active');
  startTimer();
}

/* ---- CARRUSEL CLIENTES ---- */
function initCarrusel() {
  const track = document.querySelector('.clientes-track');
  if (!track) return;
  // Duplicar items para loop infinito CSS
  const items = track.innerHTML;
  track.innerHTML = items + items;
}

/* ---- CONTADORES ANIMADOS ---- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ---- REVEAL ON SCROLL ---- */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ---- FORMULARIO GENERAL ---- */
function initForm(formId, sheetTarget, extraProcess) {
  const form = document.getElementById(formId);
  if (!form) return;

  const overlay = form.querySelector('.form-overlay');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    showOverlay(overlay, 'loading');

    try {
      const data = collectFormData(form);
      if (extraProcess) extraProcess(data);

      const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ tipo: sheetTarget, ...data }),
      });

      const result = await response.json();

      if (result.success) {
        showOverlay(overlay, 'success', result.codigo);
        form.reset();
        clearFilePreview(form);
      } else {
        throw new Error(result.message || 'Error al enviar');
      }
    } catch (err) {
      showOverlay(overlay, 'error');
      console.error('Error formulario:', err);
    }
  });

  // Cerrar overlay al hacer clic en botón "Cerrar"
  const closeBtn = overlay && overlay.querySelector('.btn-close-overlay');
  closeBtn && closeBtn.addEventListener('click', () => {
    overlay.classList.remove('show', 'loading', 'success', 'error-state');
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      field.classList.add('error');
      group && group.classList.add('has-error');
      valid = false;
    } else {
      field.classList.remove('error');
      group && group.classList.remove('has-error');
    }
  });

  // Email
  form.querySelectorAll('[type="email"]').forEach(field => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (field.value && !emailRe.test(field.value)) {
      field.classList.add('error');
      field.closest('.form-group') && field.closest('.form-group').classList.add('has-error');
      valid = false;
    }
  });

  // Checkbox required
  form.querySelectorAll('[type="checkbox"][required]').forEach(cb => {
    if (!cb.checked) {
      cb.closest('.form-group') && cb.closest('.form-group').classList.add('has-error');
      valid = false;
    }
  });

  if (!valid) {
    form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

function collectFormData(form) {
  const data = {};
  const fd = new FormData(form);
  fd.forEach((val, key) => {
    if (key !== 'archivo') data[key] = val;
  });
  data.timestamp = new Date().toISOString();
  data.pagina = window.location.href;
  return data;
}

function showOverlay(overlay, type, codigo) {
  if (!overlay) return;
  overlay.classList.remove('loading', 'success', 'error-state');
  overlay.classList.add('show', type === 'loading' ? 'loading' : type === 'success' ? 'success' : 'error-state');

  if (type === 'success' && codigo) {
    const codigoEl = overlay.querySelector('.codigo-reclamo');
    if (codigoEl) codigoEl.textContent = codigo;
  }
}

function clearFilePreview(form) {
  const preview = form.querySelector('.file-selected');
  if (preview) preview.textContent = '';
  const input = form.querySelector('[type="file"]');
  if (input) input.value = '';
}

/* ---- DRAG & DROP ARCHIVOS ---- */
function initDropzone(dropzoneId, inputId) {
  const zone = document.getElementById(dropzoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length) handleFileSelect(files[0], zone);
  });

  input.addEventListener('change', () => {
    if (input.files.length) handleFileSelect(input.files[0], zone);
  });
}

function handleFileSelect(file, zone) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type)) {
    alert('Formato no permitido. Use PDF, JPG, PNG, DOC o DOCX.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('El archivo no puede superar 10MB.');
    return;
  }
  const preview = zone.querySelector('.file-selected') || zone.parentElement.querySelector('.file-selected');
  if (preview) preview.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
}

/* ---- MAPA SVG PERÚ ---- */
function initMapaPeru() {
  const puntos = document.querySelectorAll('.mapa-punto');
  if (!puntos.length) return;

  const tooltip = document.getElementById('mapa-tooltip');

  puntos.forEach(punto => {
    punto.addEventListener('mouseenter', (e) => {
      if (!tooltip) return;
      tooltip.textContent = punto.dataset.ciudad;
      tooltip.style.opacity = '1';
    });
    punto.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.opacity = '0';
    });
  });
}

/* ---- FILTROS DE CLIENTES ---- */
function initFiltros() {
  const btns = document.querySelectorAll('.filtro-btn');
  const cards = document.querySelectorAll('.cliente-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtro = btn.dataset.filtro;
      cards.forEach(card => {
        const show = filtro === 'todos' || card.dataset.categoria === filtro;
        card.style.display = show ? 'flex' : 'none';
      });
    });
  });
}

/* ---- WHATSAPP FLOTANTE ---- */
function initWhatsApp() {
  const waBtn = document.querySelector('.wa-btn');
  if (!waBtn) return;
  const num = CONFIG.WHATSAPP_NUM;
  waBtn.addEventListener('click', () => {
    window.open(`https://wa.me/${num}?text=Hola, me gustaría obtener más información sobre los servicios de EMPSER.`, '_blank');
  });
}

/* ---- INICIO ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initCarrusel();
  initCounters();
  initReveal();
  initMapaPeru();
  initFiltros();
  initWhatsApp();

  // Formularios (se activan si el elemento existe en la página)
  initForm('form-contacto', 'CONTACTO');
  initForm('form-reclamo', 'RECLAMOS');
  initForm('form-reclutamiento', 'RECLUTAMIENTO');

  // Dropzones
  initDropzone('dropzone-cv', 'input-cv');
  initDropzone('dropzone-evidencia', 'input-evidencia');
});
