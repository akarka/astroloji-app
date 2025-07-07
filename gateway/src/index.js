const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/api/calculate-birth-chart", async (req, res) => {
  try {
    // örnek: astrology-api-adapter çağrısı
    const response = await axios.post(
      "http://astrology-api-adapter:5001/calculate-birth-chart",
      req.body
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Calculation failed" });
  }
});

app.post("/api/render-natal-chart-svg", async (req, res) => {
  try {
    const response = await axios.post(
      "http://natal-chart-svg-renderer:5002/render-natal-chart-svg",
      req.body,
      { headers: { "Content-Type": "application/json" }, responseType: "text" }
    );
    res.set("Content-Type", "image/svg+xml");
    res.send(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("SVG rendering failed");
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Gateway running on port 4000");
});
