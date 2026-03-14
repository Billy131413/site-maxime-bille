/* ============================================
   FORMULAIRE — Validation et soumission
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // --- Pré-remplir le pack depuis l'URL ---
  const urlParams = new URLSearchParams(window.location.search);
  const packParam = urlParams.get('pack');
  if (packParam) {
    const packSelect = form.querySelector('#pack');
    if (packSelect) {
      const option = Array.from(packSelect.options).find(
        opt => opt.value.toLowerCase() === packParam.toLowerCase()
      );
      if (option) option.selected = true;
    }
  }

  // --- Validation en temps réel ---
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) {
        validateField(field);
      }
    });
  });

  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Champ vide
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      message = 'Ce champ est requis.';
    }

    // Email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Veuillez entrer une adresse email valide.';
      }
    }

    // Téléphone
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\+\-\.\(\)]{8,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = 'Veuillez entrer un numéro de téléphone valide.';
      }
    }

    // Checkbox
    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      isValid = false;
      message = 'Vous devez accepter pour continuer.';
    }

    // Affichage de l'erreur
    const errorEl = field.parentElement.querySelector('.form-error');

    if (!isValid) {
      field.classList.add('invalid');
      field.classList.remove('valid');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      } else {
        const err = document.createElement('span');
        err.className = 'form-error';
        err.textContent = message;
        err.setAttribute('role', 'alert');
        err.style.cssText = 'display:block;color:#e74c3c;font-size:0.8125rem;margin-top:0.25rem;';
        field.parentElement.appendChild(err);
      }
    } else {
      field.classList.remove('invalid');
      field.classList.add('valid');
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }

    return isValid;
  }

  // --- Soumission ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Valider tous les champs
    let allValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      // Focus sur le premier champ invalide
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Collecter les données
    const formData = new FormData(form);

    // Envoi vers le backend PHP
    const submitBtn = form.querySelector('[type="submit"]');
    if (!submitBtn) return;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    fetch('send-mail.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          form.style.display = 'none';
          const successMsg = document.getElementById('form-success');
          if (successMsg) {
            successMsg.removeAttribute('hidden');
            successMsg.style.display = 'block';
            successMsg.focus();
          }
        } else {
          showFormError(data.message || 'Une erreur est survenue. Veuillez réessayer.');
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
        }
      })
      .catch(() => {
        showFormError('Impossible de joindre le serveur. Veuillez réessayer ou me contacter par email.');
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
      });
  });

  // --- Message d'erreur global ---
  function showFormError(msg) {
    let errorBanner = form.querySelector('.form-error-banner');
    if (!errorBanner) {
      errorBanner = document.createElement('div');
      errorBanner.className = 'form-error-banner';
      errorBanner.setAttribute('role', 'alert');
      errorBanner.style.cssText = 'background:#fef2f2;border:1px solid #e74c3c;color:#c0392b;padding:0.75rem 1rem;border-radius:0.5rem;margin-bottom:1rem;font-size:0.875rem;';
      form.prepend(errorBanner);
    }
    errorBanner.textContent = msg;
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --- Styles dynamiques pour validation ---
  const style = document.createElement('style');
  style.textContent = `
    .form-input.invalid,
    .form-select.invalid,
    .form-textarea.invalid {
      border-color: #e74c3c;
    }
    .form-input.invalid:focus,
    .form-select.invalid:focus,
    .form-textarea.invalid:focus {
      box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.15);
    }
    .form-input.valid,
    .form-select.valid,
    .form-textarea.valid {
      border-color: #2ecc71;
    }
  `;
  document.head.appendChild(style);
});
