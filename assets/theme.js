/* Essentiel — scripts du thème (sans dépendance). */
(() => {
  const theme = window.theme || { routes: {}, strings: {} };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const debounce = (fn, wait = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const formatMoney = (cents) => {
    const currency = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'EUR';
    const amount = new Intl.NumberFormat(document.documentElement.lang || 'fr', { style: 'currency', currency }).format(cents / 100);
    return theme.showCurrencyCode ? `${amount} ${currency}` : amount;
  };

  /* ---------- Bandeau d'annonce : messages en fondu ---------- */
  const initAnnouncement = (root = document) => {
    root.querySelectorAll('[data-announcement]').forEach((bar) => {
      const messages = bar.querySelectorAll('.announcement__message');
      if (messages.length < 2 || bar.dataset.ready || reduceMotion) return;
      bar.dataset.ready = 'true';
      let index = 0;
      let paused = false;
      bar.addEventListener('mouseenter', () => { paused = true; });
      bar.addEventListener('mouseleave', () => { paused = false; });
      bar.addEventListener('focusin', () => { paused = true; });
      bar.addEventListener('focusout', () => { paused = false; });
      setInterval(() => {
        if (paused) return;
        messages[index].classList.remove('is-active');
        messages[index].setAttribute('aria-hidden', 'true');
        index = (index + 1) % messages.length;
        messages[index].classList.add('is-active');
        messages[index].removeAttribute('aria-hidden');
      }, (Number(bar.dataset.speed) || 5) * 1000);
    });
  };

  /* ---------- Apparition au scroll ---------- */
  let observer;
  const initReveal = (root = document) => {
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (reduceMotion || document.body.classList.contains('no-anim') || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
    }
    items.forEach((el) => observer.observe(el));
  };

  /* ---------- Menus <details> du header ---------- */
  const initHeader = () => {
    const menus = document.querySelectorAll('[data-menu-drawer], [data-header-search]');
    menus.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        menus.forEach((other) => { if (other !== details) other.open = false; });
        const input = details.querySelector('input[type="search"]');
        if (input) input.focus();
      });
    });
    document.addEventListener('click', (e) => {
      menus.forEach((details) => {
        if (details.open && !details.contains(e.target)) details.open = false;
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      menus.forEach((details) => {
        if (details.open) {
          details.open = false;
          details.querySelector('summary').focus();
        }
      });
    });
  };

  /* ---------- Panier : tiroir + API Ajax Cart ---------- */
  const Cart = {
    drawer: null,
    lastFocus: null,

    init() {
      this.drawer = document.querySelector('[data-cart-drawer]');

      document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-cart-open]');
        if (opener && this.drawer) {
          e.preventDefault();
          this.open(opener);
          return;
        }
        if (e.target.closest('[data-cart-close]')) {
          e.preventDefault();
          this.close();
          return;
        }
        const qtyBtn = e.target.closest('[data-cart-qty]');
        if (qtyBtn && qtyBtn.closest('[data-drawer-content]')) {
          e.preventDefault();
          this.change(Number(qtyBtn.dataset.cartLine), Number(qtyBtn.dataset.cartQty));
        }
      });

      document.addEventListener(
        'change',
        debounce((e) => {
          const input = e.target.closest('.qty__input[data-cart-line]');
          if (input && input.closest('[data-drawer-content]')) {
            this.change(Number(input.dataset.cartLine), Math.max(0, parseInt(input.value, 10) || 0));
          }
        }, 350)
      );

      if (this.drawer) {
        this.drawer.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') this.close();
          if (e.key === 'Tab') this.trapFocus(e);
        });
      }
    },

    sectionsToRender() {
      const ids = [];
      if (document.getElementById('shopify-section-cart-drawer')) ids.push('cart-drawer');
      document.querySelectorAll('[data-cart-page]').forEach((el) => ids.push(el.dataset.sectionId));
      return ids;
    },

    open(opener) {
      if (!this.drawer) return;
      this.lastFocus = opener || document.activeElement;
      this.drawer.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => {
        this.drawer.classList.add('is-open');
        this.drawer.querySelector('.drawer__panel').focus();
      });
    },

    close() {
      if (!this.drawer || this.drawer.hidden) return;
      this.drawer.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      const done = () => { this.drawer.hidden = true; };
      if (reduceMotion) done();
      else setTimeout(done, 350);
      if (this.lastFocus) this.lastFocus.focus();
    },

    trapFocus(e) {
      const focusables = this.drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    },

    setLoading(state) {
      if (this.drawer) this.drawer.classList.toggle('is-loading', state);
      document.querySelectorAll('[data-cart-page]').forEach((el) => el.classList.toggle('is-loading', state));
    },

    renderSections(sections) {
      if (!sections) return;
      const parser = new DOMParser();
      Object.entries(sections).forEach(([id, html]) => {
        if (!html) return;
        const doc = parser.parseFromString(html, 'text/html');
        const fresh = doc.querySelector('[data-drawer-content]');
        const target = document.querySelector(`#shopify-section-${CSS.escape(id)} [data-drawer-content]`);
        if (fresh && target) target.innerHTML = fresh.innerHTML;
        const count = doc.querySelector('[data-cart-count-value]');
        if (count) this.updateCount(Number(count.textContent));
      });
    },

    updateCount(count) {
      document.querySelectorAll('[data-cart-count]').forEach((bubble) => {
        bubble.classList.toggle('is-empty', count === 0);
        const visible = bubble.querySelector('[aria-hidden]');
        if (visible) visible.textContent = count;
        const label = bubble.querySelector('.visually-hidden');
        if (label) label.textContent = count === 0 ? 'Panier vide' : `${count} article${count > 1 ? 's' : ''} dans le panier`;
        bubble.classList.remove('is-bumped');
        void bubble.offsetWidth;
        bubble.classList.add('is-bumped');
      });
    },

    async add(form) {
      const button = form.querySelector('[data-add-button]');
      const error = form.querySelector('[data-form-error]');
      const body = new FormData(form);
      body.append('sections', this.sectionsToRender().join(','));
      body.append('sections_url', window.location.pathname);
      if (button) button.setAttribute('aria-busy', 'true');
      if (error) error.hidden = true;

      try {
        const res = await fetch(`${theme.routes.cartAdd}.js`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body
        });
        const data = await res.json();
        if (!res.ok || data.status) {
          throw new Error(data.description || data.message || theme.strings.cartError);
        }
        this.renderSections(data.sections);
        this.open(button);
      } catch (err) {
        if (error) {
          error.textContent = err.message || theme.strings.cartError;
          error.hidden = false;
        }
      } finally {
        if (button) button.removeAttribute('aria-busy');
      }
    },

    async change(line, quantity) {
      this.setLoading(true);
      try {
        const res = await fetch(`${theme.routes.cartChange}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ line, quantity, sections: this.sectionsToRender(), sections_url: window.location.pathname })
        });
        const data = await res.json();
        if (!res.ok || data.status) throw new Error(data.description || theme.strings.cartError);
        this.renderSections(data.sections);
      } catch (err) {
        window.alert(err.message || theme.strings.cartError);
      } finally {
        this.setLoading(false);
      }
    }
  };

  /* ---------- Fiche produit ---------- */
  const initProduct = (section) => {
    if (section.dataset.productReady) return;
    section.dataset.productReady = 'true';

    const jsonEl = section.querySelector('[data-product-json]');
    const product = jsonEl ? JSON.parse(jsonEl.textContent) : null;
    const form = section.querySelector('[data-product-form]');
    const idSelect = section.querySelector('[data-variant-id]');
    const picker = section.querySelector('[data-variant-picker]');

    // Galerie
    const showMedia = (mediaId) => {
      if (!mediaId) return;
      const slides = section.querySelectorAll('.gallery__slide[data-media-id]');
      if (![...slides].some((s) => s.dataset.mediaId === String(mediaId))) return;
      slides.forEach((s) => {
        const active = s.dataset.mediaId === String(mediaId);
        s.hidden = !active;
        s.classList.toggle('is-active', active);
      });
      section.querySelectorAll('[data-media-target]').forEach((t) => {
        const active = t.dataset.mediaTarget === String(mediaId);
        t.classList.toggle('is-active', active);
        if (active) t.setAttribute('aria-current', 'true');
        else t.removeAttribute('aria-current');
      });
    };
    section.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-media-target]');
      if (thumb) showMedia(thumb.dataset.mediaTarget);
      const step = e.target.closest('[data-qty-step]');
      if (step) {
        const input = step.parentElement.querySelector('.qty__input');
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + Number(step.dataset.qtyStep));
      }
      const share = e.target.closest('[data-share]');
      if (share) {
        const url = share.dataset.shareUrl;
        if (navigator.share) navigator.share({ title: share.dataset.shareTitle, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => { share.textContent = theme.strings.linkCopied; });
      }
    });

    // Variantes
    if (product && picker && idSelect) {
      const selected = () => {
        const values = [];
        picker.querySelectorAll('.variant-picker__input:checked').forEach((input) => {
          values[Number(input.dataset.optionIndex)] = input.value;
        });
        return values;
      };
      const findVariant = (values) => product.variants.find((v) => v.options.every((opt, i) => opt === values[i]));

      const markAvailability = (values) => {
        picker.querySelectorAll('.variant-picker__input').forEach((input) => {
          const index = Number(input.dataset.optionIndex);
          const candidate = values.slice();
          candidate[index] = input.value;
          const match = product.variants.find((v) => v.available && v.options.every((opt, i) => opt === candidate[i]));
          const label = input.nextElementSibling;
          if (label) label.classList.toggle('is-unavailable', !match);
        });
      };

      const update = () => {
        const values = selected();
        values.forEach((value, i) => {
          const legend = picker.querySelector(`[data-option-selected="${i}"]`);
          if (legend) legend.textContent = value;
        });
        markAvailability(values);

        const variant = findVariant(values);
        const button = section.querySelector('[data-add-button]');
        const label = section.querySelector('[data-add-label]');
        const priceEl = section.querySelector('[data-price-wrapper] [data-price]');

        if (!variant) {
          if (button) button.disabled = true;
          if (label) label.textContent = theme.strings.unavailable;
          return;
        }

        idSelect.value = variant.id;
        if (button) button.disabled = !variant.available;
        if (label) label.textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;

        if (priceEl) {
          const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
          priceEl.classList.toggle('price--sale', !!onSale);
          priceEl.innerHTML = onSale
            ? `<span class="visually-hidden">Prix normal</span><s class="price__compare">${formatMoney(variant.compare_at_price)}</s><span class="visually-hidden">Prix promo</span><span class="price__current">${formatMoney(variant.price)}</span>`
            : `<span class="price__current">${formatMoney(variant.price)}</span>`;
        }

        if (variant.featured_media) showMedia(variant.featured_media.id);

        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      };

      picker.addEventListener('change', update);
      markAvailability(selected());
    }

    // Ajout au panier en Ajax (uniquement avec le tiroir)
    if (form && document.querySelector('[data-cart-drawer]')) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        Cart.add(form);
      });
    }
  };

  /* ---------- « Vous aimerez aussi » ---------- */
  const initRecommendations = async (el) => {
    if (!el || el.dataset.loaded || !el.dataset.url) return;
    el.dataset.loaded = 'true';
    try {
      const res = await fetch(el.dataset.url);
      const html = await res.text();
      const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-recommendations]');
      if (fresh && fresh.innerHTML.trim()) {
        el.innerHTML = fresh.innerHTML;
        initReveal(el);
      }
    } catch (e) {
      /* Pas de recommandations : la section reste vide. */
    }
  };

  /* ---------- Filtres de collection ---------- */
  const initFilters = (form) => {
    if (!form || form.dataset.ready) return;
    form.dataset.ready = 'true';
    const submit = debounce(() => {
      const params = new URLSearchParams(new FormData(form));
      [...params.entries()].forEach(([key, value]) => { if (value === '') params.delete(key); });
      window.location.href = `${form.getAttribute('action')}?${params.toString()}#ProductGrid`;
    }, 500);
    form.addEventListener('change', submit);
  };

  /* ---------- Démarrage ---------- */
  const initAll = (root = document) => {
    initReveal(root);
    initAnnouncement(root);
    root.querySelectorAll('[data-product-section]').forEach(initProduct);
    root.querySelectorAll('[data-recommendations]').forEach(initRecommendations);
    root.querySelectorAll('[data-filters-form]').forEach(initFilters);
  };

  // Sélecteur de pays / devise : envoi immédiat
  document.addEventListener('change', (e) => {
    const select = e.target.closest('[data-localization-select]');
    if (select) select.form.submit();
  });

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    Cart.init();
    initAll();
  });

  // Éditeur de thème Shopify
  document.addEventListener('shopify:section:load', (e) => {
    initAll(e.target);
    if (e.target.querySelector('[data-cart-drawer]')) Cart.drawer = e.target.querySelector('[data-cart-drawer]');
  });
  document.addEventListener('shopify:block:select', (e) => {
    e.target.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    if (e.target.classList.contains('reveal')) e.target.classList.add('is-visible');
  });
})();
