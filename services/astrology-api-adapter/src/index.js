const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/calculate-birth-chart", async (req, res) => {
  const { name, birth_date, birth_time, birth_place } = req.body;

  // örnek dummy response (gerçek api çağrısı eklenir)
  const dummyResponse = {
    status: "success",
    data: {
      person: { name, birth_date, birth_time, birth_place },
      planet_positions: [
        { planet: "Sun", sign: "Taurus", degree: 2.33, house: 1 },
      ],
      houses: [{ house_number: 1, sign: "Taurus", degree: 0 }],
    },
  };

  res.json(dummyResponse);
});

app.listen(process.env.PORT || 5001, () => {
  console.log("Astrology API Adapter running on port 5001");
});
