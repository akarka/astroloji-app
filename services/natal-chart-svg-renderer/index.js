const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Dummy SVG generator (natal chart placeholder)
function generateNatalChartSVG(data) {
  // data: { person, planet_positions, houses } gibi bir JSON beklenir
  // Şimdilik sadece basit bir daire ve gezegen isimleriyle dummy SVG dönecek
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 150;
  const planets = (data.planet_positions || []).slice(0, 10); // max 10 gezegen

  // Gezegenleri daire etrafında eşit aralıklı yerleştir
  const planetSVG = planets
    .map((planet, i) => {
      const angle = (2 * Math.PI * i) / planets.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `<text x="${x}" y="${y}" font-size="16" text-anchor="middle" fill="#6c3aff">${planet.planet}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#f5f3ff" stroke="#6c3aff" stroke-width="4" />
  <text x="${centerX}" y="40" font-size="20" text-anchor="middle" fill="#6c3aff">Natal Chart</text>
  ${planetSVG}
</svg>`;
}

app.post("/render-natal-chart-svg", (req, res) => {
  const data = req.body;
  const svg = generateNatalChartSVG(data);
  res.set("Content-Type", "image/svg+xml");
  res.send(svg);
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Natal Chart SVG Renderer running on port ${PORT}`);
});
