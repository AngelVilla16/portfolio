/**
 * Portfolio JavaScript
 * Handles theme switching, mobile navigation, scroll effects, and form handling
 */

(function() {
  'use strict';

  // ========================================
  // Theme Management
  // ========================================
  const ThemeManager = {
    init() {
      this.themeToggle = document.getElementById('themeToggle');
      this.html = document.documentElement;
      this.theme = this.getStoredTheme() || this.getPreferredTheme();
      this.applyTheme(this.theme);
      this.bindEvents();
    },

    getPreferredTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    getStoredTheme() {
      return localStorage.getItem('theme');
    },

    storeTheme(theme) {
      localStorage.setItem('theme', theme);
    },

    applyTheme(theme) {
      this.html.setAttribute('data-theme', theme);
      this.storeTheme(theme);
      this.updateToggleIcon(theme);
    },

    updateToggleIcon(theme) {
      if (this.themeToggle) {
        this.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      }
    },

    toggle() {
      const newTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.theme = newTheme;
      this.applyTheme(newTheme);
    },

    bindEvents() {
      if (this.themeToggle) {
        this.themeToggle.addEventListener('click', () => this.toggle());
      }

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!this.getStoredTheme()) {
          this.theme = e.matches ? 'dark' : 'light';
          this.applyTheme(this.theme);
        }
      });
    }
  };

  // ========================================
  // Mobile Navigation
  // ========================================
  const MobileNav = {
    init() {
      this.toggle = document.getElementById('mobileMenuToggle');
      this.nav = document.getElementById('nav');
      this.navLinks = this.nav?.querySelectorAll('.nav-link');
      this.isOpen = false;
      this.bindEvents();
    },

    bindEvents() {
      if (!this.toggle || !this.nav) return;

      this.toggle.addEventListener('click', () => this.toggleMenu());

      // Close on link click
      this.navLinks?.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
        }
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.nav.contains(e.target) && !this.toggle.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Handle resize
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && this.isOpen) {
          this.closeMenu();
        }
      });
    },

    toggleMenu() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    },

    openMenu() {
      this.isOpen = true;
      this.nav.classList.add('open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.toggle.setAttribute('aria-label', 'Cerrar menú');
      document.body.style.overflow = 'hidden';
    },

    closeMenu() {
      this.isOpen = false;
      this.nav.classList.remove('open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    }
  };

  // ========================================
  // Active Navigation Highlighting
  // ========================================
  const NavHighlighter = {
    init() {
      this.sections = document.querySelectorAll('section[id]');
      this.navLinks = document.querySelectorAll('.nav-link[data-section]');
      this.observerOptions = {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      };
      this.bindEvents();
    },

    bindEvents() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => this.handleIntersection(entries), this.observerOptions);
        this.sections.forEach(section => this.observer.observe(section));
      } else {
        // Fallback for older browsers
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      }
    },

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          this.updateActiveLink(id);
        }
      });
    },

    handleScroll() {
      const scrollPos = window.scrollY + window.innerHeight * 0.3;
      this.sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          this.updateActiveLink(id);
        }
      });
    },

    updateActiveLink(activeId) {
      this.navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        if (section === activeId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
      });
    },

    handleClick(e, anchor) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without scrolling
        history.pushState(null, '', targetId);
      }
    }
  };

  // ========================================
  // Form Handling
  // ========================================
  const FormHandler = {
    init() {
      this.form = document.querySelector('.contact-form');
      if (this.form) {
        this.bindEvents();
      }
    },

    bindEvents() {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));

      // Real-time validation
      this.form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearError(input));
      });
    },

    validateField(field) {
      const errorEl = field.parentElement?.querySelector('.form-error');
      if (!errorEl) return true;

      let isValid = true;
      let message = '';

      if (field.required && !field.value.trim()) {
        isValid = false;
        message = 'Este campo es obligatorio';
      } else if (field.type === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
          isValid = false;
          message = 'Introduce un correo electrónico válido';
        }
      }

      if (!isValid) {
        field.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
      } else {
        field.removeAttribute('aria-invalid');
        errorEl.textContent = '';
      }

      return isValid;
    },

    clearError(field) {
      const errorEl = field.parentElement?.querySelector('.form-error');
      if (errorEl && field.value.trim()) {
        errorEl.textContent = '';
        field.removeAttribute('aria-invalid');
      }
    },

    validateForm() {
      const fields = this.form.querySelectorAll('input[required], textarea[required]');
      let isValid = true;

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    },

    async handleSubmit(e) {
      e.preventDefault();

      if (!this.validateForm()) {
        this.showStatus('Por favor, corrige los errores del formulario', 'error');
        return;
      }

      const submitBtn = this.form.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-text">Enviando...</span><svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
      submitBtn.style.pointerEvents = 'none';

      try {
        const formData = new FormData(this.form);
        const response = await fetch(this.form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          this.showStatus('¡Mensaje enviado correctamente! Te responderé pronto.', 'success');
          this.form.reset();
        } else {
          throw new Error('Error al enviar el formulario');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.showStatus('Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.pointerEvents = '';
      }
    },

    showStatus(message, type) {
      const statusEl = this.form.querySelector('.form-status');
      if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `form-status ${type}`;

        // Clear after 5 seconds for success messages
        if (type === 'success') {
          setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'form-status';
          }, 5000);
        }
      }
    }
  };

  // ========================================
  // Scroll Animations
  // ========================================
  const ScrollAnimations = {
    init() {
      this.animatedElements = document.querySelectorAll(
        '.about-card, .skill-category, .project-card, .contact-form'
      );

      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries) => this.handleIntersection(entries),
          { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
        );
        this.animatedElements.forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          this.observer.observe(el);
        });
      } else {
        // Fallback: show all immediately
        this.animatedElements.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    },

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          this.observer.unobserve(entry.target);
        }
      });
    }
  };

  // ========================================
  // Header Scroll Effect
  // ========================================
  const HeaderScroll = {
    init() {
      this.header = document.querySelector('.header');
      this.lastScrollY = 0;
      this.ticking = false;
      this.bindEvents();
    },

    bindEvents() {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },

    onScroll() {
      if (!this.ticking) {
        window.requestAnimationFrame(() => this.updateHeader());
        this.ticking = true;
      }
    },

    updateHeader() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        this.header.style.boxShadow = 'var(--shadow-md)';
        this.header.style.backgroundColor = 'rgba(var(--color-bg-elevated), 0.95)';
      } else {
        this.header.style.boxShadow = 'none';
        this.header.style.backgroundColor = 'rgba(var(--color-bg-elevated), 0.85)';
      }

      this.lastScrollY = currentScrollY;
      this.ticking = false;
    }
  };

  // ========================================
  // Initialize All Modules
  // ========================================
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initModules);
    } else {
      initModules();
    }
  }

  function initModules() {
    ThemeManager.init();
    MobileNav.init();
    NavHighlighter.init();
    SmoothScroll.init();
    FormHandler.init();
    ScrollAnimations.init();
    HeaderScroll.init();

    // Add loaded class for CSS animations
    document.body.classList.add('loaded');
  }

  // Start initialization
  init();

  // Export for debugging (optional)
  window.Portfolio = {
    ThemeManager,
    MobileNav,
    NavHighlighter,
    FormHandler
  };
})();