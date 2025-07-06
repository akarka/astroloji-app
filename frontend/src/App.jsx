import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });
  const [loading, setLoading] = useState(false);
  const [birthChart, setBirthChart] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(
        "https://your-gateway-url.com/api/calculate-birth-chart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      setBirthChart(data.data);
    } catch (error) {
      console.error("Error calculating birth chart:", error);
      // For now, show dummy data
      setBirthChart({
        person: formData,
        planet_positions: [
          { planet: "Sun", sign: "Taurus", degree: 2.33, house: 1 },
          { planet: "Moon", sign: "Cancer", degree: 15.45, house: 3 },
          { planet: "Mercury", sign: "Taurus", degree: 28.12, house: 1 },
          { planet: "Venus", sign: "Gemini", degree: 8.67, house: 2 },
          { planet: "Mars", sign: "Aries", degree: 22.89, house: 12 },
        ],
        houses: [
          { house_number: 1, sign: "Taurus", degree: 0 },
          { house_number: 2, sign: "Gemini", degree: 15 },
          { house_number: 3, sign: "Cancer", degree: 30 },
          { house_number: 4, sign: "Leo", degree: 45 },
          { house_number: 5, sign: "Virgo", degree: 60 },
          { house_number: 6, sign: "Libra", degree: 75 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🪐 Astroloji App
          </h1>
          <p className="text-xl text-gray-300">
            Doğum haritanızı hesaplayın ve gezegen pozisyonlarınızı keşfedin
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Birth Chart Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Doğum Bilgileri
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Adınız ve soyadınız"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Doğum Saati
                  </label>
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Doğum Yeri
                  </label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Şehir, Ülke"
                    required
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "🔄 Hesaplanıyor..."
                    : "✨ Doğum Haritasını Hesapla"}
                </button>
              </div>
            </form>
          </div>

          {/* Birth Chart Results */}
          {birthChart && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Doğum Haritası Sonuçları
              </h2>

              {/* Person Info */}
              <div className="mb-8 p-6 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  👤 Kişi Bilgileri
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Ad:</strong> {birthChart.person.name}
                  </div>
                  <div>
                    <strong>Doğum Tarihi:</strong>{" "}
                    {birthChart.person.birth_date}
                  </div>
                  <div>
                    <strong>Doğum Saati:</strong> {birthChart.person.birth_time}
                  </div>
                  <div>
                    <strong>Doğum Yeri:</strong> {birthChart.person.birth_place}
                  </div>
                </div>
              </div>

              {/* Planet Positions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  🪐 Gezegen Pozisyonları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {birthChart.planet_positions.map((planet, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{planet.planet}</span>
                        <span className="text-purple-300">{planet.sign}</span>
                      </div>
                      <div className="text-sm text-gray-300 mt-2">
                        <div>Derece: {planet.degree}°</div>
                        <div>Ev: {planet.house}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Houses */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  🏠 Ev Pozisyonları
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {birthChart.houses.map((house, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/5 rounded-lg border border-white/10 text-center"
                    >
                      <div className="font-semibold">
                        {house.house_number}. Ev
                      </div>
                      <div className="text-purple-300 text-sm">
                        {house.sign}
                      </div>
                      <div className="text-xs text-gray-300">
                        {house.degree}°
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-400">
          <p>© 2025 Astroloji App - Microservice Tabanlı Astroloji Sistemi</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
