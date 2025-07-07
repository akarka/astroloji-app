import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const svgRendererUrl = process.env.VITE_SVG_RENDERER_URL;
    const response = await axios.post(
      `${svgRendererUrl}/render-natal-chart-svg`,
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.status(200).send(response.data); // SVG dönecek
  } catch (err) {
    res.status(500).json({ error: "SVG rendering failed" });
  }
}
