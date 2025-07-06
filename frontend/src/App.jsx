import { useState, useEffect } from "react";
import InputField from "./components/InputField";
import SelectField from "./components/SelectField";
import TableMaster from "./components/TableMaster";
import { birthChartService } from "./lib/supabase";
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
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load saved calculations on component mount
  useEffect(() => {
    console.log("App component mounted"); // Debug log
    loadSavedCalculations();
  }, []);

  const loadSavedCalculations = async () => {
    try {
      const calculations = await birthChartService.getCalculations();
      setSavedCalculations(calculations);
    } catch (error) {
      console.error("Error loading calculations:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value); // Debug log
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use Vercel API route
      const response = await fetch("/api/calculate-birth-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      const birthChartData = data.data;
      setBirthChart(birthChartData);

      // Save to Supabase
      await birthChartService.saveCalculation(formData, birthChartData);

      // Reload saved calculations
      await loadSavedCalculations();
    } catch (error) {
      console.error("Error calculating birth chart:", error);
      // For now, show dummy data
      const dummyData = {
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
      };

      setBirthChart(dummyData);

      // Save dummy data to Supabase
      try {
        await birthChartService.saveCalculation(formData, dummyData);
        await loadSavedCalculations();
      } catch (saveError) {
        console.error("Error saving to Supabase:", saveError);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCalculation = (calculation) => {
    const resultData = calculation.result_json;
    setFormData(resultData.person);
    setBirthChart(resultData);
    setShowHistory(false);
  };

  const deleteCalculation = async (id) => {
    try {
      await birthChartService.deleteCalculation(id);
      await loadSavedCalculations();
    } catch (error) {
      console.error("Error deleting calculation:", error);
    }
  };

  // Table configurations
  const planetColumns = [
    { key: "planet", label: "Gezegen", sortable: true },
    { key: "sign", label: "Burç", sortable: true },
    { key: "degree", label: "Derece", sortable: true },
    { key: "house", label: "Ev", sortable: true },
  ];

  const houseColumns = [
    { key: "house_number", label: "Ev No", sortable: true },
    { key: "sign", label: "Burç", sortable: true },
    { key: "degree", label: "Derece", sortable: true },
  ];

  const historyColumns = [
    { key: "person_name", label: "Ad", sortable: true },
    { key: "birth_date", label: "Doğum Tarihi", sortable: true },
    { key: "created_at", label: "Hesaplama Tarihi", sortable: true },
    { key: "actions", label: "İşlemler", sortable: false },
  ];

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

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showHistory
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              🆕 Yeni Hesaplama
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showHistory
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              📚 Geçmiş ({savedCalculations.length})
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!showHistory ? (
            <>
              {/* Birth Chart Form */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Doğum Bilgileri
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Ad Soyad"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Adınız ve soyadınız"
                      inputClassName="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                    />

                    <InputField
                      label="Doğum Tarihi"
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      inputClassName="bg-white/10 border-white/20 text-white"
                      required
                    />

                    <InputField
                      label="Doğum Saati"
                      type="time"
                      name="birthTime"
                      value={formData.birthTime}
                      onChange={handleInputChange}
                      inputClassName="bg-white/10 border-white/20 text-white"
                      required
                    />

                    <InputField
                      label="Doğum Yeri"
                      type="text"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleInputChange}
                      placeholder="Şehir, Ülke"
                      inputClassName="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                    />
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
                        <strong>Doğum Saati:</strong>{" "}
                        {birthChart.person.birth_time}
                      </div>
                      <div>
                        <strong>Doğum Yeri:</strong>{" "}
                        {birthChart.person.birth_place}
                      </div>
                    </div>
                  </div>

                  {/* Planet Positions Table */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                      🪐 Gezegen Pozisyonları
                    </h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <TableMaster
                        columns={planetColumns}
                        data={birthChart.planet_positions}
                        keyField="planet"
                        sortable={true}
                        renderRow={(planet) => [
                          <td key="planet" className="p-2 border text-white">
                            {planet.planet}
                          </td>,
                          <td key="sign" className="p-2 border text-purple-300">
                            {planet.sign}
                          </td>,
                          <td key="degree" className="p-2 border text-white">
                            {planet.degree}°
                          </td>,
                          <td key="house" className="p-2 border text-white">
                            {planet.house}
                          </td>,
                        ]}
                      />
                    </div>
                  </div>

                  {/* Houses Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      🏠 Ev Pozisyonları
                    </h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <TableMaster
                        columns={houseColumns}
                        data={birthChart.houses}
                        keyField="house_number"
                        sortable={true}
                        renderRow={(house) => [
                          <td
                            key="house_number"
                            className="p-2 border text-white"
                          >
                            {house.house_number}. Ev
                          </td>,
                          <td key="sign" className="p-2 border text-purple-300">
                            {house.sign}
                          </td>,
                          <td key="degree" className="p-2 border text-white">
                            {house.degree}°
                          </td>,
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* History View */
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                📚 Hesaplama Geçmişi
              </h2>

              {savedCalculations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    Henüz kaydedilmiş hesaplama bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-4">
                  <TableMaster
                    columns={historyColumns}
                    data={savedCalculations.map((calc) => ({
                      ...calc,
                      person_name: calc.result_json.person.name,
                      birth_date: calc.result_json.person.birth_date,
                    }))}
                    keyField="id"
                    sortable={true}
                    renderRow={(calculation) => [
                      <td key="name" className="p-2 border text-white">
                        {calculation.result_json.person.name}
                      </td>,
                      <td key="date" className="p-2 border text-white">
                        {calculation.result_json.person.birth_date}
                      </td>,
                      <td key="created" className="p-2 border text-white">
                        {new Date(calculation.created_at).toLocaleDateString(
                          "tr-TR"
                        )}
                      </td>,
                      <td key="actions" className="p-2 border">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => loadCalculation(calculation)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            👁️ Görüntüle
                          </button>
                          <button
                            onClick={() => deleteCalculation(calculation.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </td>,
                    ]}
                  />
                </div>
              )}
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
