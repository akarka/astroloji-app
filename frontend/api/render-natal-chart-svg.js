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

// --- Helper: Polar to Cartesian ---
function polarToCartesian(cx, cy, r, angleDeg) {
  // Astrological: 0° Aries = 9 o'clock, artan açı counter-clockwise
  // SVG: 0° = 3 o'clock, artan açı clockwise
  // Dönüşüm: (angleDeg - 90) (0° = yukarı, saat yönüyle artan)
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// --- Main SVG Generator ---
function generateNatalChartSVG(data) {
  // SVG boyutları ve merkez
  const width = 600,
    height = 600,
    cx = 300,
    cy = 300;
  const outerRadius = 290,
    zodiacOuter = 280,
    zodiacInner = 230,
    houseOuter = 225,
    houseInner = 160,
    centerRadius = 90;

  // Eksik veri kontrolü
  if (!data || !data.planet_positions || !data.house_cusps) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" text-anchor="middle" fill="red" font-size="24">Eksik veri</text></svg>`;
  }

  // --- SVG Katmanları ---
  const svgStyle = `<style>text{user-select:none;}@media(max-width:600px){svg{width:100vw!important;height:auto!important;}}</style>`;

  // 1. Çemberler (temel katmanlar)
  const circles = drawCoreCircles(cx, cy, {
    outerRadius,
    zodiacOuter,
    zodiacInner,
    houseOuter,
    houseInner,
    centerRadius,
  });

  // 2. Zodiac kuşağı (segmentler, isimler, glyph'ler, degree marker'lar)
  const zodiac = drawZodiacBelt(cx, cy, zodiacOuter, zodiacInner);
  const degreeMarkers = drawDegreeMarkers(cx, cy, zodiacOuter, zodiacInner);

  // 3. Evler (segmentler, numaralar, cusp çizgileri, alt bölümler)
  const houses = drawHouses(
    cx,
    cy,
    houseOuter,
    houseInner,
    zodiacInner,
    data.house_cusps
  );

  // 4. Gezegen glyph'leri
  const planets = drawPlanets(
    cx,
    cy,
    houseInner,
    centerRadius,
    data.planet_positions
  );

  // 5. Aspect çizgileri
  const aspects = drawAspects(
    cx,
    cy,
    houseInner,
    centerRadius,
    data.planet_positions,
    data.aspects
  );

  // 6. Başlık ve doğum bilgisi (isteğe bağlı)
  const title = data.birth_info
    ? `<text x="50%" y="40" text-anchor="middle" font-size="18" fill="#888">${
        data.birth_info.name || ""
      } ${data.birth_info.birth_date || ""} ${
        data.birth_info.birth_time || ""
      } ${data.birth_info.birth_city || ""}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${svgStyle}
  <g>
    ${circles}
    ${zodiac}
    ${degreeMarkers}
    ${houses}
    ${planets}
    ${aspects}
    ${title}
  </g>
</svg>`;
}

// --- Çemberler ---
function drawCoreCircles(cx, cy, r) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r.outerRadius}" fill="#3c3744" stroke="#fff" stroke-width="2" />
    <circle cx="${cx}" cy="${cy}" r="${r.zodiacOuter}" fill="none" stroke="#fff" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r.zodiacInner}" fill="none" stroke="#fff" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r.houseOuter}" fill="#fff" stroke="#3c3744" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r.houseInner}" fill="#fff" stroke="#3c3744" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r.centerRadius}" fill="#fff" stroke="#3c3744" stroke-width="1" />
  `;
}

// --- Zodiac Kuşağı ---
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
function drawZodiacBelt(cx, cy, outerR, innerR) {
  let out = "";
  for (let i = 0; i < 12; i++) {
    const start = i * 30,
      end = (i + 1) * 30;
    const mid = start + 15;
    const segPath = describeArcPath(cx, cy, outerR, innerR, start, end);
    const namePos = polarToCartesian(cx, cy, (outerR + innerR) / 2, mid);
    const glyphPos = polarToCartesian(cx, cy, outerR - 18, mid);
    out += `
      <path d="${segPath}" fill="#4A4A52" />
      <text x="${namePos.x}" y="${
      namePos.y - 10
    }" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#fff" letter-spacing="2">${
      ZODIAC_SIGNS[i].name
    }</text>
      <text x="${glyphPos.x}" y="${
      glyphPos.y + 18
    }" text-anchor="middle" font-size="28" font-family="serif" fill="#fff">${
      ZODIAC_SIGNS[i].glyph
    }</text>
    `;
  }
  return out;
}

// --- Degree Markers ---
function drawDegreeMarkers(cx, cy, outerR, innerR) {
  let out = "";
  for (let i = 0; i < 360; i++) {
    const isMajor = i % 10 === 0;
    const r1 = isMajor ? outerR : outerR - 10;
    const r2 = innerR;
    const a = i;
    const p1 = polarToCartesian(cx, cy, r1, a);
    const p2 = polarToCartesian(cx, cy, r2, a);
    out += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${
      p2.y
    }" stroke="#ccc" stroke-width="${isMajor ? 1 : 0.5}" stroke-dasharray="${
      isMajor ? "2,4" : "1,3"
    }" />\n`;
  }
  return out;
}

// --- House Segmentleri ve Numaraları ---
function drawHouses(cx, cy, outerR, innerR, zodiacInnerR, houseCusps) {
  if (!Array.isArray(houseCusps) || houseCusps.length !== 12) return "";
  let out = "";
  // Segmentler ve numaralar
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i].longitude;
    const end = houseCusps[(i + 1) % 12].longitude;
    const mid = (start + ((end - start + 360) % 360) / 2) % 360;
    const segPath = describeArcPath(cx, cy, outerR, innerR, start, end);
    const numPos = polarToCartesian(cx, cy, (outerR + innerR) / 2, mid);
    out += `
      <path d="${segPath}" fill="#fff" />
      <text x="${numPos.x}" y="${
      numPos.y + 6
    }" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#bbb">${
      houseCusps[i].house
    }</text>
    `;
  }
  // Cusp çizgileri
  for (let i = 0; i < 12; i++) {
    const angle = houseCusps[i].longitude;
    const p1 = polarToCartesian(cx, cy, zodiacInnerR, angle);
    const p2 = polarToCartesian(cx, cy, innerR, angle);
    out += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#888" stroke-width="2" />\n`;
  }
  // Alt bölümler (her evin kendi aralığında 5,10,15...)
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i].longitude;
    const end = houseCusps[(i + 1) % 12].longitude;
    const span = (end - start + 360) % 360;
    for (let j = 1; j < span / 5; j++) {
      const angle = (start + j * 5) % 360;
      const p1 = polarToCartesian(cx, cy, outerR, angle);
      const p2 = polarToCartesian(cx, cy, innerR, angle);
      out += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ccc" stroke-width="1" stroke-dasharray="2,4" />\n`;
    }
  }
  return out;
}

// --- Gezegen Glyph'leri ---
function drawPlanets(cx, cy, houseInnerR, centerR, planetPositions) {
  if (!Array.isArray(planetPositions)) return "";
  let out = "";
  for (const p of planetPositions) {
    const angle = p.longitude;
    const pos = polarToCartesian(cx, cy, (houseInnerR + centerR) / 2, angle);
    out += `<text x="${pos.x}" y="${
      pos.y
    }" text-anchor="middle" font-size="28" font-family="serif" fill="#222">${
      p.glyph || "?"
    }</text>`;
  }
  return out;
}

// --- Aspect Çizgileri ---
function drawAspects(cx, cy, houseInnerR, centerR, planetPositions, aspects) {
  if (!Array.isArray(aspects) || !Array.isArray(planetPositions)) return "";
  const planetMap = Object.fromEntries(planetPositions.map((p) => [p.name, p]));
  let out = "";
  for (const asp of aspects) {
    const p1 = planetMap[asp.p1];
    const p2 = planetMap[asp.p2];
    if (p1 && p2) {
      const pos1 = polarToCartesian(
        cx,
        cy,
        (houseInnerR + centerR) / 2,
        p1.longitude
      );
      const pos2 = polarToCartesian(
        cx,
        cy,
        (houseInnerR + centerR) / 2,
        p2.longitude
      );
      out += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${
        pos2.y
      }" stroke="${asp.color || "#808080"}" stroke-width="${
        asp.stroke_width || 2
      }" stroke-opacity="0.8" />\n`;
    }
  }
  return out;
}

// --- Arc Path Helper ---
function describeArcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  // Büyük yay
  const startOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = (endAngle - startAngle + 360) % 360 > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}
