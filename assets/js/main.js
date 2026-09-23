document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Toggle
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const html = document.documentElement;
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcons(newTheme);
    });
  });

  function updateThemeIcons(theme) {
    document.querySelectorAll('.theme-icon-light').forEach(icon => {
      icon.style.display = theme === 'dark' ? 'none' : 'block';
    });
    document.querySelectorAll('.theme-icon-dark').forEach(icon => {
      icon.style.display = theme === 'dark' ? 'block' : 'none';
    });
  }

  // 2. RTL Toggle
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  const savedRtl = localStorage.getItem('rtl') === 'true';
  if (savedRtl) {
    html.setAttribute('dir', 'rtl');
  }

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Disable transitions for the flip so the off-canvas drawer doesn't
      // animate across the screen when it swaps sides.
      html.classList.add('dir-switching');
      const isRtl = html.getAttribute('dir') === 'rtl';
      if (isRtl) {
        html.removeAttribute('dir');
        localStorage.setItem('rtl', 'false');
      } else {
        html.setAttribute('dir', 'rtl');
        localStorage.setItem('rtl', 'true');
      }
      void html.offsetWidth; // flush styles before re-enabling transitions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => html.classList.remove('dir-switching'));
      });
    });
  });

  // 3. Mobile Drawer
  const hamburger = document.querySelector('.hamburger');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  
  function toggleDrawer() {
    document.body.classList.toggle('drawer-open');
    if (document.body.classList.contains('drawer-open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  if (hamburger) hamburger.addEventListener('click', toggleDrawer);
  if (drawerClose) drawerClose.addEventListener('click', toggleDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', toggleDrawer);

  // 4. Sticky Header
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 5. Form Validation
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          showError(input, 'This field is required');
        } else if (input.type === 'email' && !validateEmail(input.value)) {
          isValid = false;
          showError(input, 'Invalid email address');
        } else if (input.type === 'password' && input.value.length < 8) {
          isValid = false;
          showError(input, 'Password must be at least 8 characters');
        } else if (input.id === 'confirmPassword') {
          const pass = form.querySelector('#password');
          if (pass && pass.value !== input.value) {
            isValid = false;
            showError(input, 'Passwords do not match');
          }
        } else {
          removeError(input);
        }
      });

      const termsCheck = form.querySelector('input[type="checkbox"][required]');
      if (termsCheck && !termsCheck.checked) {
        isValid = false;
        showError(termsCheck, 'You must accept the terms');
      }

      if (isValid) {
        // Show success state (mock)
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-check-circle"></i> Success';
        btn.style.backgroundColor = 'var(--success-color)';
        setTimeout(() => {
          form.reset();
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
        }, 3000);
      }
    });

    // Clear error on input
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => removeError(input));
    });
  });

  function showError(input, message) {
    input.classList.add('error');
    let msgEl = input.nextElementSibling;
    if (!msgEl || !msgEl.classList.contains('error-msg')) {
      msgEl = document.createElement('span');
      msgEl.className = 'error-msg';
      input.parentNode.insertBefore(msgEl, input.nextSibling);
    }
    msgEl.textContent = message;
  }

  function removeError(input) {
    input.classList.remove('error');
    const msgEl = input.nextElementSibling;
    if (msgEl && msgEl.classList.contains('error-msg')) {
      msgEl.remove();
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 6. Scroll Animations (IntersectionObserver)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scrolled');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.animate-fade-up').forEach(el => {
    observer.observe(el);
  });

  // 7. Savings Calculator Logic (index.html)
  const calcVolume = document.getElementById('calc-volume');
  const calcTicket = document.getElementById('calc-ticket');

  if (calcVolume && calcTicket) {
    const volDisplay = document.getElementById('vol-display');
    const ticketDisplay = document.getElementById('ticket-display');
    const txnDisplay = document.getElementById('calc-txn-count');
    const calcSavings = document.getElementById('calc-savings');
    const annualDisplay = document.getElementById('calc-annual');
    const compFeeDisplay = document.getElementById('comp-fee');
    const nexaFeeDisplay = document.getElementById('nexa-fee');

    // Published card-present averages used for the estimate.
    const COMP_RATE = 0.029, COMP_FIXED = 0.30;
    const NEXA_RATE = 0.024, NEXA_FIXED = 0.10;

    const money = (n, digits) => '$' + n.toLocaleString(undefined, {
      minimumFractionDigits: digits === undefined ? 2 : digits,
      maximumFractionDigits: digits === undefined ? 2 : digits
    });

    // Paints the filled portion of the track up to the thumb.
    function paintTrack(input) {
      const min = Number(input.min), max = Number(input.max);
      const pct = ((Number(input.value) - min) / (max - min)) * 100;
      input.style.setProperty('--slider-fill', pct + '%');
    }

    function updateCalculator() {
      const vol = Number(calcVolume.value);
      const ticket = Number(calcTicket.value);
      const transactions = Math.round(vol / ticket);

      paintTrack(calcVolume);
      paintTrack(calcTicket);

      if (volDisplay) volDisplay.textContent = money(vol, 0);
      if (ticketDisplay) ticketDisplay.textContent = money(ticket, 0);
      if (txnDisplay) txnDisplay.textContent = transactions.toLocaleString();

      const compFee = (vol * COMP_RATE) + (transactions * COMP_FIXED);
      const nexaFee = (vol * NEXA_RATE) + (transactions * NEXA_FIXED);
      const savings = compFee - nexaFee;

      if (compFeeDisplay) compFeeDisplay.textContent = money(compFee);
      if (nexaFeeDisplay) nexaFeeDisplay.textContent = money(nexaFee);
      if (calcSavings) calcSavings.textContent = money(savings);
      if (annualDisplay) annualDisplay.textContent = money(savings * 12, 0);
    }

    calcVolume.addEventListener('input', updateCalculator);
    calcTicket.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  // 8. API Code Explorer Logic (home2.html)
  const codeTabs = document.querySelectorAll('.code-tab');
  const codeDisplay = document.getElementById('api-code-display');
  const copyBtn = document.getElementById('copy-api-code');
  
  if (codeTabs.length > 0 && codeDisplay) {
    const snippets = {
      node: `const paynexa = require('paynexa')('sk_test_12345');

const charge = await paynexa.charges.create({
  amount: 2000,
  currency: 'usd',
  source: 'tok_visa',
  description: 'Order #1024',
});

console.log(charge.status); // "succeeded"`,
      python: `import paynexa
paynexa.api_key = "sk_test_12345"

charge = paynexa.Charge.create(
    amount=2000,
    currency="usd",
    source="tok_visa",
    description="Order #1024",
)

print(charge.status) # "succeeded"`
    };

    const showTab = (tab) => {
      if (!tab || tab.classList.contains('active')) return;
      codeTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      codeDisplay.textContent = snippets[tab.getAttribute('data-lang')];
      // restart the swap animation
      codeDisplay.classList.remove('is-swapping');
      void codeDisplay.offsetWidth;
      codeDisplay.classList.add('is-swapping');
    };

    codeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        stopRotation();
        showTab(tab);
      });
    });

    // Auto-cycle through the languages so the block reads as interactive.
    // Pauses on hover/focus, while off screen, and stops once the visitor
    // picks a tab themselves.
    const codeBlock = codeDisplay.closest('.code-block-wrapper') || codeDisplay;
    const ROTATE_MS = 4500;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rotateTimer = null;
    let userTookOver = false;
    let onScreen = false;

    const tick = () => {
      const current = document.querySelector('.code-tab.active') || codeTabs[0];
      const next = codeTabs[(Array.prototype.indexOf.call(codeTabs, current) + 1) % codeTabs.length];
      showTab(next);
    };

    function startRotation() {
      if (rotateTimer || userTookOver || reduceMotion || !onScreen) return;
      rotateTimer = setInterval(tick, ROTATE_MS);
      codeBlock.classList.remove('is-paused');
    }

    function pauseRotation() {
      clearInterval(rotateTimer);
      rotateTimer = null;
      codeBlock.classList.add('is-paused');
    }

    function stopRotation() {
      userTookOver = true;
      pauseRotation();
    }

    codeBlock.addEventListener('mouseenter', pauseRotation);
    codeBlock.addEventListener('mouseleave', startRotation);
    codeBlock.addEventListener('focusin', pauseRotation);
    codeBlock.addEventListener('focusout', startRotation);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          onScreen = entry.isIntersecting;
          if (onScreen) startRotation();
          else pauseRotation();
        });
      }, { threshold: 0.35 }).observe(codeBlock);
    } else {
      onScreen = true;
      startRotation();
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeDisplay.textContent).then(() => {
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="ph ph-check"></i> Copied';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
    }
  }

  // Back to Top
  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '<i class="ph ph-arrow-up"></i>';
  document.body.appendChild(backToTop);

  const toggleBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});
