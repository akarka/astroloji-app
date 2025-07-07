import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    // TODO: Mikroservis URL'ini güncelle
    const response = await axios.post(
      "http://astrology-api-adapter:5001/calculate-birth-chart", // Gerekirse public URL ile değiştir
      req.body
    );
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Calculation failed" });
  }
}
