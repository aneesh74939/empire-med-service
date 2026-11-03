(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  // Gentle scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { el.classList.add('will-reveal'); io.observe(el); });
  }

  // Forms
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^[+()\-.\s\d]{7,25}$/;
  var FALLBACK = 'We could not send your message. Please email or call us instead.';

  function setError(form, field, message) {
    var box = form.querySelector('[data-error-for="' + field.name + '"]');
    field.toggleAttribute('aria-invalid', !!message);
    if (message) field.setAttribute('aria-invalid', 'true');
    if (box) { box.textContent = message || ''; box.hidden = !message; }
  }

  function check(field) {
    var value = field.value.trim();
    var label = field.getAttribute('data-label') || 'this field';
    if (field.required && !value) {
      return field.tagName === 'SELECT' ? 'Choose your ' + label + '.' : 'Enter your ' + label + '.';
    }
    if (value && field.type === 'email' && !EMAIL.test(value)) return 'Enter a valid email address.';
    if (value && field.type === 'tel' && !PHONE.test(value)) return 'Enter a valid phone number.';
    return '';
  }

  document.querySelectorAll('form[data-ajax]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var labelEl = button.querySelector('.btn-label');
    var idle = labelEl.textContent;
    var fields = Array.prototype.filter.call(form.elements, function (el) {
      return el.matches('input:not([type=hidden]):not([name=company_website]), select, textarea');
    });
    form.setAttribute('novalidate', '');

    function show(kind, message) {
      status.textContent = message;
      status.className = 'form-status is-' + kind;
      status.hidden = false;
      status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    }

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.value.trim() || field.getAttribute('aria-invalid')) setError(form, field, check(field));
      });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid')) setError(form, field, check(field));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;
      status.hidden = true;
      var firstBad = null;
      fields.forEach(function (field) {
        var message = check(field);
        setError(form, field, message);
        if (message && !firstBad) firstBad = field;
      });
      if (firstBad) {
        show('error', 'Check the highlighted fields and try again.');
        firstBad.focus();
        return;
      }

      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.classList.add('is-loading');
      labelEl.textContent = 'Sending…';

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      }).then(function (res) {
        return res.json().catch(function () { return { ok: false }; });
      }).then(function (data) {
        if (data.ok) {
          form.reset();
          fields.forEach(function (field) { setError(form, field, ''); });
          show('success', form.getAttribute('data-success'));
          status.focus();
          return;
        }
        if (data.fieldErrors) {
          var bad = null;
          fields.forEach(function (field) {
            var message = data.fieldErrors[field.name];
            if (message) { setError(form, field, message); bad = bad || field; }
          });
          if (bad) bad.focus();
        }
        show('error', data.error || FALLBACK);
      }).catch(function () {
        show('error', FALLBACK);
      }).finally(function () {
        form.removeAttribute('aria-busy');
        button.disabled = false;
        button.classList.remove('is-loading');
        labelEl.textContent = idle;
      });
    });
  });
})();
