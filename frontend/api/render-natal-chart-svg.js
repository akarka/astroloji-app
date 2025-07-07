export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  const data = req.body;
  const svg = generateNatalChartSVG(data);
  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svg);
}

const ZODIAC_SIGNS = [
  { name: "ARIES", glyph: "\u2648" },
  { name: "TAURUS", glyph: "\u2649" },
  { name: "GEMINI", glyph: "\u264A" },
  { name: "CANCER", glyph: "\u264B" },
  { name: "LEO", glyph: "\u264C" },
  { name: "VIRGO", glyph: "\u264D" },
  { name: "LIBRA", glyph: "\u264E" },
  { name: "SCORPIO", glyph: "\u264F" },
  { name: "SAGITTARIUS", glyph: "\u2650" },
  { name: "CAPRICORN", glyph: "\u2651" },
  { name: "AQUARIUS", glyph: "\u2652" },
  { name: "PISCES", glyph: "\u2653" },
];

const PLANET_GLYPHS = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
  Uranus: "\u2645",
  Neptune: "\u2646",
  Pluto: "\u2647",
  "North Node": "\u260A",
  "South Node": "\u260B",
  Chiron: "\u26B7",
  Lilith: "\u26B8",
  ASC: "ASC",
  MC: "MC",
};

function generateNatalChartSVG(data) {
  const width = 600;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 280;
  const zodiacInnerRadius = 230;
  const houseOuterRadius = 225;
  const houseInnerRadius = 160;
  const centerRadius = 90;

  // Zodiac Segments (still fixed, 12x30deg)
  const zodiacSegments = ZODIAC_SIGNS.map((sign, i) => {
    const startAngle = i * 30;
    const endAngle = (i + 1) * 30;
    const start = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const end = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const innerStart = polarToCartesian(
      centerX,
      centerY,
      zodiacInnerRadius,
      startAngle
    );
    const innerEnd = polarToCartesian(
      centerX,
      centerY,
      zodiacInnerRadius,
      endAngle
    );
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${outerRadius} ${outerRadius} 0 0 1 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
    const midAngle = startAngle + 15;
    const namePos = polarToCartesian(
      centerX,
      centerY,
      (outerRadius + zodiacInnerRadius) / 2,
      midAngle
    );
    const glyphPos = polarToCartesian(
      centerX,
      centerY,
      outerRadius - 18,
      midAngle
    );
    return `
      <path d="${d}" fill="#4A4A52" />
      <text x="${namePos.x}" y="${
      namePos.y - 10
    }" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#fff" letter-spacing="2">${
      sign.name
    }</text>
      <text x="${glyphPos.x}" y="${
      glyphPos.y + 18
    }" text-anchor="middle" font-size="28" font-family="serif" fill="#fff">${
      sign.glyph
    }</text>
    `;
  }).join("\n");

  // Zodiac dotted lines (degree ticks)
  let zodiacDottedLines = "";
  for (let i = 0; i < 360; i += 1) {
    const isMajor = i % 30 === 0;
    const r1 = zodiacInnerRadius;
    const r2 = isMajor ? outerRadius : outerRadius - 10;
    const a = i;
    const p1 = polarToCartesian(centerX, centerY, r1, a);
    const p2 = polarToCartesian(centerX, centerY, r2, a);
    zodiacDottedLines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${
      p2.y
    }" stroke="#ccc" stroke-width="${isMajor ? 2 : 1}" stroke-dasharray="${
      isMajor ? "0" : "2,4"
    }" />\n`;
  }

  // House cusp lines and numbers (from data.house_cusps)
  let houseCuspLines = "";
  let houseNumbers = "";
  if (Array.isArray(data.house_cusps)) {
    for (let i = 0; i < data.house_cusps.length; i++) {
      const cusp = data.house_cusps[i];
      const angle = cusp.longitude; // 0-360, 0=Aries
      // Cusp line
      const p1 = polarToCartesian(centerX, centerY, zodiacInnerRadius, angle);
      const p2 = polarToCartesian(centerX, centerY, houseInnerRadius, angle);
      houseCuspLines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#888" stroke-width="2" />\n`;
      // House number (placed at middle between this cusp and next)
      const nextCusp = data.house_cusps[(i + 1) % data.house_cusps.length];
      let midAngle =
        (cusp.longitude +
          ((nextCusp.longitude - cusp.longitude + 360) % 360) / 2) %
        360;
      const numPos = polarToCartesian(
        centerX,
        centerY,
        (houseOuterRadius + houseInnerRadius) / 2,
        midAngle
      );
      houseNumbers += `<text x="${numPos.x}" y="${
        numPos.y + 6
      }" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#bbb">${
        cusp.house
      }</text>\n`;
    }
  }

  // House dotted lines (subdivisions, still fixed for now)
  let houseDottedLines = "";
  for (let i = 0; i < 12; i++) {
    for (let j = 1; j < 6; j++) {
      const angle = i * 30 + j * 5;
      const p1 = polarToCartesian(centerX, centerY, houseOuterRadius, angle);
      const p2 = polarToCartesian(centerX, centerY, houseInnerRadius, angle);
      houseDottedLines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ccc" stroke-width="1" stroke-dasharray="2,4" />\n`;
    }
  }

  // Central white circle
  const centerCircle = `<circle cx="${centerX}" cy="${centerY}" r="${centerRadius}" fill="#fff" />`;

  // Planet glyphs (from data.planet_positions, by longitude)
  let planetGlyphs = "";
  if (Array.isArray(data.planet_positions)) {
    data.planet_positions.forEach((p) => {
      const angle = p.longitude;
      const pos = polarToCartesian(
        centerX,
        centerY,
        (houseInnerRadius + centerRadius) / 2,
        angle
      );
      planetGlyphs += `<text x="${pos.x}" y="${
        pos.y
      }" text-anchor="middle" font-size="28" font-family="serif" fill="#222">${
        PLANET_GLYPHS[p.name] || "?"
      }</text>`;
    });
  }

  // Zodiac positions (ASC, MC, Vertex, etc.)
  let specialPoints = "";
  if (Array.isArray(data.zodiac_positions)) {
    data.zodiac_positions.forEach((z) => {
      const angle = z.degree + (z.minute || 0) / 60 + zodiacSignToAngle(z.sign);
      const pos = polarToCartesian(
        centerX,
        centerY,
        zodiacInnerRadius + 18,
        angle
      );
      specialPoints += `<text x="${pos.x}" y="${
        pos.y
      }" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#FFD700">${
        PLANET_GLYPHS[z.name] || z.name
      }</text>`;
    });
  }

  // Aspect lines (from data.aspects)
  let aspectLines = "";
  if (Array.isArray(data.aspects) && Array.isArray(data.planet_positions)) {
    const planetMap = Object.fromEntries(
      data.planet_positions.map((p) => [p.name, p])
    );
    data.aspects.forEach((asp) => {
      const p1 = planetMap[asp.p1];
      const p2 = planetMap[asp.p2];
      if (p1 && p2) {
        const pos1 = polarToCartesian(
          centerX,
          centerY,
          (houseInnerRadius + centerRadius) / 2,
          p1.longitude
        );
        const pos2 = polarToCartesian(
          centerX,
          centerY,
          (houseInnerRadius + centerRadius) / 2,
          p2.longitude
        );
        aspectLines += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${
          pos2.x
        }" y2="${pos2.y}" stroke="${asp.color || "#808080"}" stroke-width="${
          asp.stroke_width || 2
        }" />\n`;
      }
    });
  }

  // SVG CSS
  const svgStyle = `
    <style>
      text { user-select: none; }
      @media (max-width: 600px) {
        svg { width: 100vw !important; height: auto !important; }
      }
    </style>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${svgStyle}
  <g>
    ${zodiacSegments}
    ${zodiacDottedLines}
    ${houseCuspLines}
    ${houseNumbers}
    ${houseDottedLines}
    ${aspectLines}
    ${centerCircle}
    ${planetGlyphs}
    ${specialPoints}
  </g>
</svg>`;
}

// Helper: polar to cartesian (0° = yukarı, saat yönüyle artan)
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Zodiac sign name to angle (0° ARIES, 30° TAURUS, ...)
function zodiacSignToAngle(sign) {
  const idx = ZODIAC_SIGNS.findIndex((z) => z.name === sign.toUpperCase());
  return idx >= 0 ? idx * 30 : 0;
}
