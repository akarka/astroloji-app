export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, birthDate, birthTime, birthPlace } = req.body;

    // Validate required fields
    if (!name || !birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        error:
          "Missing required fields: name, birthDate, birthTime, birthPlace",
      });
    }

    // TODO: Replace with actual microservice calls
    // For now, return dummy data that matches your microservice format

    const dummyResponse = {
      status: "success",
      data: {
        person: {
          name,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: birthPlace,
        },
        planet_positions: [
          { planet: "Sun", sign: "Taurus", degree: 2.33, house: 1 },
          { planet: "Moon", sign: "Cancer", degree: 15.45, house: 3 },
          { planet: "Mercury", sign: "Taurus", degree: 28.12, house: 1 },
          { planet: "Venus", sign: "Gemini", degree: 8.67, house: 2 },
          { planet: "Mars", sign: "Aries", degree: 22.89, house: 12 },
          { planet: "Jupiter", sign: "Pisces", degree: 45.67, house: 11 },
          { planet: "Saturn", sign: "Capricorn", degree: 12.34, house: 10 },
          { planet: "Uranus", sign: "Aquarius", degree: 8.91, house: 9 },
          { planet: "Neptune", sign: "Pisces", degree: 23.45, house: 8 },
          { planet: "Pluto", sign: "Sagittarius", degree: 67.89, house: 7 },
        ],
        houses: [
          { house_number: 1, sign: "Taurus", degree: 0 },
          { house_number: 2, sign: "Gemini", degree: 15 },
          { house_number: 3, sign: "Cancer", degree: 30 },
          { house_number: 4, sign: "Leo", degree: 45 },
          { house_number: 5, sign: "Virgo", degree: 60 },
          { house_number: 6, sign: "Libra", degree: 75 },
          { house_number: 7, sign: "Scorpio", degree: 90 },
          { house_number: 8, sign: "Sagittarius", degree: 105 },
          { house_number: 9, sign: "Capricorn", degree: 120 },
          { house_number: 10, sign: "Aquarius", degree: 135 },
          { house_number: 11, sign: "Pisces", degree: 150 },
          { house_number: 12, sign: "Aries", degree: 165 },
        ],
      },
    };

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.status(200).json(dummyResponse);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
