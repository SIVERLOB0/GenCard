// FILE: ./public/js/main.js
// main.js

document.addEventListener('DOMContentLoaded', () => {
  /* ====== Elements ====== */
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  const form = document.querySelector('#binForm');
  const resultsTableBody = document.querySelector('#results tbody');
  const expInput = document.querySelector('#exp');
  const binInfoBox = document.getElementById('bin-info'); // Panel de BIN

  /* ====== Helpers ====== */
  const openMenu = () => {
    if (!menuToggle || !sideMenu) return;
    menuToggle.classList.add('active');
    sideMenu.style.display = 'block';
    sideMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-label', 'Cerrar menú');
  };

  const closeMenu = () => {
    if (!menuToggle || !sideMenu) return;
    menuToggle.classList.remove('active');
    sideMenu.style.display = 'none';
    sideMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  };

  const toggleMenu = () => {
    if (!sideMenu) return;
    const isOpen = sideMenu.style.display === 'block';
    isOpen ? closeMenu() : openMenu();
  };

  const clearResults = () => {
    if (resultsTableBody) resultsTableBody.innerHTML = '';
    if (binInfoBox) {
      const details = binInfoBox.querySelector('.bin-details');
      if (details) {
        details.innerHTML = '<p>Esperando consulta...</p>';
      }
    }
  };

  const markRowCopied = tr => {
    if (!tr) return;
    tr.classList.add('copied');
  };

  const safeText = s => (typeof s === 'string' ? s : String(s));

  /* ====== Menu: toggle, outside click, ESC ====== */
  if (menuToggle && sideMenu) {
    sideMenu.style.display = sideMenu.style.display === 'block' ? 'block' : 'none';
    sideMenu.setAttribute('aria-hidden', sideMenu.style.display === 'block' ? 'false' : 'true');

    menuToggle.addEventListener('click', e => {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', e => {
      if (!sideMenu || !menuToggle) return;
      if (sideMenu.style.display !== 'block') return;
      const target = e.target;
      if (sideMenu.contains(target) || menuToggle.contains(target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ====== Date input: auto-format MM/YY ====== */
  if (expInput) {
    expInput.addEventListener('input', () => {
      let digits = expInput.value.replace(/[^0-9]/g, '');
      if (digits.length === 1 && parseInt(digits[0], 10) > 1) {
        digits = '0' + digits;
      }
      if (digits.length > 4) digits = digits.slice(0, 4);
      if (digits.length >= 3) {
        digits = digits.slice(0, 2) + '/' + digits.slice(2);
      }
      expInput.value = digits;
    });
  }

  /* ====== Form submit: validation, request, render ====== */
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const bin = form.bin?.value?.trim() ?? '';
      const exp = form.exp?.value?.trim() ?? '';
      const cvv = form.cvv?.value?.trim() ?? '';
      const qtyRaw = form.quantity?.value?.trim() ?? '';
      const quantity = qtyRaw ? Math.max(1, Math.min(50, parseInt(qtyRaw, 10) || 1)) : undefined;

      // BIN validation
      if (!bin || bin.length > 16 || !/^[0-9xX]+$/.test(bin)) {
        return alert('El BIN o patrón es inválido. Usa solo números y "x", máximo 16 caracteres.');
      }

      // Exp validation
      if (exp) {
        const m = exp.match(/^(\d{2})\/(\d{2})$/);
        if (!m) return alert('Fecha inválida. Usa formato MM/YY.');
        const mm = parseInt(m[1], 10);
        const yy = 2000 + parseInt(m[2], 10);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        if (mm < 1 || mm > 12) return alert('Mes inválido.');
        if (yy < currentYear || yy > 2050) return alert(`Año inválido. Debe ser entre ${currentYear} y 2050.`);
        if (yy === currentYear && mm < currentMonth) return alert('La fecha no puede ser anterior al mes actual.');
      }

      // CVV validation
      if (cvv && !/^\d{3}$/.test(cvv)) return alert('CVV inválido. Debe tener 3 dígitos.');

      // Build query
      const params = new URLSearchParams({ bin });
      if (exp) params.set('exp', exp);
      if (cvv) params.set('cvv', cvv);
      if (quantity) params.set('quantity', String(quantity));

      try {
        // Mostrar loader en el panel BIN
        if (binInfoBox) {
          const details = binInfoBox.querySelector('.bin-details');
          if (details) {
            details.innerHTML = `
              <div><span class="loader"></span> Consultando BIN...</div>
            `;
          }
        }

        const res = await fetch(`/cards?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const cards = Array.isArray(data.cards) ? data.cards : [];

        // Limpiar resultados previos de la tabla
        if (resultsTableBody) resultsTableBody.innerHTML = '';

        /* === Mostrar info del BIN === */
        if (binInfoBox) {
          const details = binInfoBox.querySelector('.bin-details');
          if (details) {
            if (data.binInfo && data.binInfo.data) {
              const info = data.binInfo.data;

              const labels = {
                "BIN/IIN": "Bin",
                "Tipo de tarjeta": "Tarjeta",
                "Emisor / Nombre del banco": "Banco",
                "Nombre del país": "País",
                "Código ISO del país": "ISO"
              };

              details.innerHTML = `
                <p><strong>${labels["BIN/IIN"]}:</strong> ${info["BIN/IIN"]}</p>
                <p><strong>${labels["Tipo de tarjeta"]}:</strong> ${info["Tipo de tarjeta"]}</p>
                <p><strong>${labels["Emisor / Nombre del banco"]}:</strong> ${info["Emisor / Nombre del banco"]}</p>
                <p><strong>${labels["Nombre del país"]}:</strong> ${info["Nombre del país"]} (${info["Código ISO del país"]})</p>
              `;
            } else {
              details.innerHTML = `<p>No se pudo obtener información del BIN.</p>`;
            }
          }
        }

        /* === Mostrar tarjetas === */
        if (cards.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.colSpan = 4;
          td.textContent = 'No se generaron tarjetas.';
          tr.appendChild(td);
          resultsTableBody.appendChild(tr);
        } else {
          cards.forEach(card => {
            const tr = document.createElement('tr');

            // Columna Copiar
            const tdAction = document.createElement('td');
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copiar';
            copyBtn.title = 'Copiar tarjeta en formato Card|MM|YYYY|CVV';

            copyBtn.addEventListener('click', async () => {
              try {
                const expVal = card.exp || '';
                let mm = '', yyyy = '';
                if (/^\d{2}\/\d{2}$/.test(expVal)) {
                  const parts = expVal.split('/');
                  mm = parts[0];
                  yyyy = '20' + parts[1];
                }
                const textToCopy = `${card.number}|${mm}|${yyyy}|${card.cvv}`;
                await navigator.clipboard.writeText(textToCopy);
                markRowCopied(tr);
              } catch (err) {
                console.error('Error al copiar:', err);
                alert('No se pudo copiar al portapapeles.');
              }
            });

            tdAction.appendChild(copyBtn);

            // Columna Número
            const tdNumber = document.createElement('td');
            tdNumber.textContent = safeText(card.number);

            // Columna Exp
            const tdExp = document.createElement('td');
            tdExp.textContent = safeText(card.exp || '');

            // Columna CVV
            const tdCvv = document.createElement('td');
            tdCvv.textContent = safeText(card.cvv || '');

            // Añadir columnas en orden (Copiar → Número → Exp → CVV)
            tr.appendChild(tdAction);
            tr.appendChild(tdNumber);
            tr.appendChild(tdExp);
            tr.appendChild(tdCvv);

            resultsTableBody.appendChild(tr);
          });
        }
      } catch (err) {
        console.error(err);
        alert('Error al generar tarjetas: ' + (err.message || 'desconocido'));
      }
    });
  }

  /* ====== Accessibility: close menu on nav link click (mobile) ====== */
  if (sideMenu) {
    sideMenu.addEventListener('click', e => {
      const target = e.target;
      if (target.tagName === 'A') {
        closeMenu();
      }
    });
  }

  /* ====== Optional: close menu on resize (desktop behavior) ====== */
  window.addEventListener('resize', () => {
    if (!sideMenu) return;
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
});