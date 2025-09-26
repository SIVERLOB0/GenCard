// FILE: ./src/CardGen/utils/binInfo.js
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Consulta la página de pulse.pst.net para un BIN de 6 dígitos
 * y devuelve la información parseada.
 */
async function getBinInfo(bin6) {
  const url = `https://pulse.pst.net/es/bin/${bin6}`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/122.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const result = {};

    $(".bin-info-row").each((_, el) => {
      const title = $(el).find(".bin-info-row__title").text().trim();
      const value = $(el).find(".bin-info-row__value").text().trim();
      if (title && value) {
        result[title] = value;
      }
    });

    return { success: true, data: result };
  } catch (err) {
    console.error("Error consultando Pulse:", err.message);
    return { success: false, error: "No se pudo obtener información del BIN" };
  }
}

module.exports = { getBinInfo };