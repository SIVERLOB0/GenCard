// FILE: src/CardGen/controllers/cardsController.js
const fs = require('fs');
const path = require('path');

// Archivo de cache en el mismo directorio raíz del proyecto
const cacheFile = path.join(__dirname, '../../binCache.json');

/* ====== Helpers para cache ====== */
function ensureCacheFile() {
  if (!fs.existsSync(cacheFile)) {
    fs.writeFileSync(cacheFile, JSON.stringify({}, null, 2), 'utf8');
  }
}

function loadCache() {
  ensureCacheFile();
  return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
}

function saveCache(cache) {
  ensureCacheFile();
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

/* ====== Obtener info del BIN ====== */
async function getBinInfo(bin) {
  let cache = loadCache();

  // Si ya está en cache
  if (cache[bin]) {
    return { success: true, data: cache[bin], cached: true };
  }

  try {
    const response = await fetch(`https://lookup.binlist.net/${bin}`);
    if (!response.ok) throw new Error('Respuesta no OK');
    const data = await response.json();

    const info = {
      "BIN/IIN": bin,
      "Tipo de tarjeta": data.scheme?.toUpperCase() || 'N/A',
      "Emisor / Nombre del banco": data.bank?.name || 'N/A',
      "Nombre del país": data.country?.name || 'N/A',
      "Código ISO del país": data.country?.alpha3 || 'N/A'
    };

    cache[bin] = info;
    saveCache(cache);

    return { success: true, data: info, cached: false };
  } catch (err) {
    console.error("Fallo al consultar binlist:", err.message);

    // fallback: devolver info mínima
    const fallback = {
      "BIN/IIN": bin,
      "Tipo de tarjeta": "Desconocido",
      "Emisor / Nombre del banco": "N/A",
      "Nombre del país": "N/A",
      "Código ISO del país": "N/A"
    };

    return { success: false, data: fallback, cached: false };
  }
}

/* ====== Generar tarjetas ====== */
async function generateCards(req, res) {
  try {
    const { bin, exp, cvv, quantity = 1 } = req.query;

    if (!bin) {
      return res.status(400).json({ error: 'BIN requerido' });
    }

    // Obtener info del BIN (desde cache o API con fallback)
    const binInfo = await getBinInfo(bin);

    // Generar tarjetas
    const cards = [];
    for (let i = 0; i < quantity; i++) {
      const number = bin + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
      const expDate =
        exp ||
        `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(
          25 + Math.floor(Math.random() * 5)
        )}`;
      const cvvCode = cvv || String(Math.floor(Math.random() * 900) + 100);
      cards.push({ number, exp: expDate, cvv: cvvCode });
    }

    res.json({ success: true, binInfo, cards });
  } catch (err) {
    console.error('Error en generateCards:', err);
    res.status(500).json({ error: 'Error generando tarjetas' });
  }
}

module.exports = { getBinInfo, generateCards };