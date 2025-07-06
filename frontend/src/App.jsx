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
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'calculator', 'results', 'people', 'planets', 'houses'
  const [editingResults, setEditingResults] = useState(false);
  const [editingPerson, setEditingPerson] = useState(false);
  const [editingPlanets, setEditingPlanets] = useState([]);
  const [editingHouses, setEditingHouses] = useState([]);
  const [editingPersonData, setEditingPersonData] = useState({});
  const [selectedPlanet, setSelectedPlanet] = useState("");
  const [selectedHouse, setSelectedHouse] = useState("");

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
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log("New formData:", newData); // Debug log
      return newData;
    });
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
      const savedRecord = await birthChartService.saveCalculation(
        formData,
        birthChartData
      );

      // Reload saved calculations
      await loadSavedCalculations();

      // Navigate to results page
      setCurrentView("results");
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
    if (resultData?.person) {
      setFormData(resultData.person);
      setBirthChart(resultData);
      setCurrentView("results");
    } else {
      console.error("Invalid calculation data:", calculation);
      alert("Bu kayıt geçersiz veri içeriyor.");
    }
  };

  const deleteCalculation = async (id) => {
    try {
      await birthChartService.deleteCalculation(id);
      await loadSavedCalculations();
    } catch (error) {
      console.error("Error deleting calculation:", error);
    }
  };

  const viewCalculation = (calculation) => {
    const resultData = calculation.result_json;
    if (resultData?.person) {
      setFormData(resultData.person);
      setBirthChart(resultData);
      setCurrentView("results");
    } else {
      console.error("Invalid calculation data:", calculation);
      alert("Bu kayıt geçersiz veri içeriyor.");
    }
  };

  const startEditingResults = () => {
    setEditingResults(true);
    setEditingPlanets([...birthChart.planet_positions]);
    setEditingHouses([...birthChart.houses]);
  };

  const startEditingPerson = () => {
    setEditingPerson(true);
    setEditingPersonData({ ...birthChart.person });
  };

  const saveResultsEdit = async () => {
    try {
      setLoading(true);

      const updatedData = {
        ...birthChart,
        planet_positions: editingPlanets,
        houses: editingHouses,
      };

      // Update local state
      setBirthChart(updatedData);
      setEditingResults(false);
    } catch (error) {
      console.error("Error updating results:", error);
      alert("Sonuçları güncellerken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const cancelResultsEdit = () => {
    setEditingResults(false);
    setEditingPlanets([]);
    setEditingHouses([]);
  };

  const savePersonEdit = async () => {
    try {
      setLoading(true);

      const updatedData = {
        ...birthChart,
        person: editingPersonData,
      };

      // Update local state
      setBirthChart(updatedData);
      setEditingPerson(false);
    } catch (error) {
      console.error("Error updating person data:", error);
      alert("Kişi bilgilerini güncellerken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const cancelPersonEdit = () => {
    setEditingPerson(false);
    setEditingPersonData({});
  };

  const updatePersonField = (field, value) => {
    setEditingPersonData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePlanet = (index, field, value) => {
    const updatedPlanets = [...editingPlanets];
    updatedPlanets[index] = { ...updatedPlanets[index], [field]: value };
    setEditingPlanets(updatedPlanets);
  };

  const updateHouse = (index, field, value) => {
    const updatedHouses = [...editingHouses];
    updatedHouses[index] = { ...updatedHouses[index], [field]: value };
    setEditingHouses(updatedHouses);
  };

  // Gezegen filtreleme fonksiyonları
  const getPlanetFilteredPeople = (planetName) => {
    return savedCalculations.filter((calc) =>
      calc.result_json?.planet_positions?.some(
        (planet) => planet.planet_name === planetName
      )
    );
  };

  const getHouseFilteredPeople = (houseNumber) => {
    return savedCalculations.filter((calc) =>
      calc.result_json?.house_positions?.some(
        (house) => house.house_number === parseInt(houseNumber)
      )
    );
  };

  const getAllPlanets = () => {
    const planets = new Set();
    savedCalculations.forEach((calc) => {
      calc.result_json?.planet_positions?.forEach((planet) => {
        planets.add(planet.planet_name);
      });
    });
    return Array.from(planets).sort();
  };

  const getAllHouses = () => {
    const houses = new Set();
    savedCalculations.forEach((calc) => {
      calc.result_json?.house_positions?.forEach((house) => {
        houses.add(house.house_number);
      });
    });
    return Array.from(houses).sort((a, b) => a - b);
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

  const databaseColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Ad Soyad", sortable: true },
    { key: "birth_date", label: "Doğum Tarihi", sortable: true },
    { key: "birth_time", label: "Doğum Saati", sortable: true },
    { key: "birth_place", label: "Doğum Yeri", sortable: true },
    { key: "planets_count", label: "Gezegen Sayısı", sortable: true },
    { key: "created_at", label: "Oluşturulma Tarihi", sortable: true },
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

          {/* Ana Sayfa Butonu */}
          {currentView !== "dashboard" && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                🏠 Ana Sayfaya Dön
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentView === "dashboard" && (
            <div className="p-6">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                🪐 Astroloji Analiz Merkezi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yeni İnsan Ekle */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-4">👤</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Yeni İnsan Ekle
                    </h3>
                    <p className="text-purple-100 mb-4">
                      Yeni bir kişi için doğum haritası hesapla
                    </p>
                    <button
                      onClick={() => setCurrentView("calculator")}
                      className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                    >
                      Hesaplamaya Başla
                    </button>
                  </div>
                </div>

                {/* İnsanların Gezegenleri */}
                <div className="bg-gradient-to-br from-green-600 to-teal-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      İnsanların Gezegenleri
                    </h3>
                    <p className="text-green-100 mb-4">
                      Kişilerin gezegen pozisyonlarını görüntüle
                    </p>
                    <button
                      onClick={() => setCurrentView("people")}
                      className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                      Kişileri Görüntüle
                    </button>
                  </div>
                </div>

                {/* Gezegenlerin İnsanları */}
                <div className="bg-gradient-to-br from-orange-600 to-red-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🪐</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Gezegenlerin İnsanları
                    </h3>
                    <p className="text-orange-100 mb-4">
                      Aynı gezegene sahip kişileri filtrele
                    </p>
                    <button
                      onClick={() => setCurrentView("planets")}
                      className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Gezegen Analizi
                    </button>
                  </div>
                </div>

                {/* Evlerin İnsanları */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏠</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Evlerin İnsanları
                    </h3>
                    <p className="text-indigo-100 mb-4">
                      Aynı eve sahip kişileri filtrele
                    </p>
                    <button
                      onClick={() => setCurrentView("houses")}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      Ev Analizi
                    </button>
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {savedCalculations.length}
                  </div>
                  <div className="text-gray-300">Toplam Kişi</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white mb-2">12</div>
                  <div className="text-gray-300">Gezegen Pozisyonu</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white mb-2">12</div>
                  <div className="text-gray-300">Ev Pozisyonu</div>
                </div>
              </div>
            </div>
          )}

          {currentView === "calculator" && (
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
            </>
          )}

          {currentView === "results" && birthChart && (
            /* Results View */
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  📊 Doğum Haritası Sonuçları
                </h2>
                <div className="flex gap-2">
                  {editingResults ? (
                    <>
                      <button
                        onClick={saveResultsEdit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        {loading ? "🔄 Kaydediliyor..." : "💾 Kaydet"}
                      </button>
                      <button
                        onClick={cancelResultsEdit}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                      >
                        ❌ İptal
                      </button>
                    </>
                  ) : editingPerson ? (
                    <>
                      <button
                        onClick={savePersonEdit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        {loading ? "🔄 Kaydediliyor..." : "💾 Kaydet"}
                      </button>
                      <button
                        onClick={cancelPersonEdit}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                      >
                        ❌ İptal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startEditingResults}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                      >
                        ✏️ Sonuçları Düzenle
                      </button>
                      <button
                        onClick={startEditingPerson}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                      >
                        👤 Kişi Bilgilerini Düzenle
                      </button>
                      <button
                        onClick={() => setCurrentView("calculator")}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
                      >
                        🆕 Yeni Hesaplama
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Person Info */}
              <div className="mb-8 p-6 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  👤 Kişi Bilgileri
                </h3>
                {editingPerson ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={editingPersonData.name || ""}
                        onChange={(e) =>
                          updatePersonField("name", e.target.value)
                        }
                        className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Doğum Tarihi
                      </label>
                      <input
                        type="date"
                        value={editingPersonData.birth_date || ""}
                        onChange={(e) =>
                          updatePersonField("birth_date", e.target.value)
                        }
                        className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Doğum Saati
                      </label>
                      <input
                        type="time"
                        value={editingPersonData.birth_time || ""}
                        onChange={(e) =>
                          updatePersonField("birth_time", e.target.value)
                        }
                        className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Doğum Yeri
                      </label>
                      <input
                        type="text"
                        value={editingPersonData.birth_place || ""}
                        onChange={(e) =>
                          updatePersonField("birth_place", e.target.value)
                        }
                        className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Planet Positions Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  🪐 Gezegen Pozisyonları
                </h3>
                <div className="bg-white/5 rounded-lg p-4">
                  {editingResults ? (
                    <div className="space-y-2">
                      {editingPlanets.map((planet, index) => (
                        <div
                          key={planet.planet}
                          className="grid grid-cols-4 gap-4 p-3 bg-white/5 rounded-lg"
                        >
                          <div className="text-white font-medium">
                            {planet.planet}
                          </div>
                          <select
                            value={planet.sign}
                            onChange={(e) =>
                              updatePlanet(index, "sign", e.target.value)
                            }
                            className="bg-gray-800 border border-white/20 text-white rounded px-2 py-1"
                          >
                            <option
                              value="Aries"
                              className="bg-gray-800 text-white"
                            >
                              Aries
                            </option>
                            <option
                              value="Taurus"
                              className="bg-gray-800 text-white"
                            >
                              Taurus
                            </option>
                            <option
                              value="Gemini"
                              className="bg-gray-800 text-white"
                            >
                              Gemini
                            </option>
                            <option
                              value="Cancer"
                              className="bg-gray-800 text-white"
                            >
                              Cancer
                            </option>
                            <option
                              value="Leo"
                              className="bg-gray-800 text-white"
                            >
                              Leo
                            </option>
                            <option
                              value="Virgo"
                              className="bg-gray-800 text-white"
                            >
                              Virgo
                            </option>
                            <option
                              value="Libra"
                              className="bg-gray-800 text-white"
                            >
                              Libra
                            </option>
                            <option
                              value="Scorpio"
                              className="bg-gray-800 text-white"
                            >
                              Scorpio
                            </option>
                            <option
                              value="Sagittarius"
                              className="bg-gray-800 text-white"
                            >
                              Sagittarius
                            </option>
                            <option
                              value="Capricorn"
                              className="bg-gray-800 text-white"
                            >
                              Capricorn
                            </option>
                            <option
                              value="Aquarius"
                              className="bg-gray-800 text-white"
                            >
                              Aquarius
                            </option>
                            <option
                              value="Pisces"
                              className="bg-gray-800 text-white"
                            >
                              Pisces
                            </option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={planet.degree}
                            onChange={(e) =>
                              updatePlanet(
                                index,
                                "degree",
                                parseFloat(e.target.value)
                              )
                            }
                            className="bg-gray-800 border border-white/20 text-white rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={planet.house}
                            onChange={(e) =>
                              updatePlanet(
                                index,
                                "house",
                                parseInt(e.target.value)
                              )
                            }
                            className="bg-gray-800 border border-white/20 text-white rounded px-2 py-1"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Houses Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  🏠 Ev Pozisyonları
                </h3>
                <div className="bg-white/5 rounded-lg p-4">
                  {editingResults ? (
                    <div className="space-y-2">
                      {editingHouses.map((house, index) => (
                        <div
                          key={house.house_number}
                          className="grid grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg"
                        >
                          <div className="text-white font-medium">
                            {house.house_number}. Ev
                          </div>
                          <select
                            value={house.sign}
                            onChange={(e) =>
                              updateHouse(index, "sign", e.target.value)
                            }
                            className="bg-gray-800 border border-white/20 text-white rounded px-2 py-1"
                          >
                            <option
                              value="Aries"
                              className="bg-gray-800 text-white"
                            >
                              Aries
                            </option>
                            <option
                              value="Taurus"
                              className="bg-gray-800 text-white"
                            >
                              Taurus
                            </option>
                            <option
                              value="Gemini"
                              className="bg-gray-800 text-white"
                            >
                              Gemini
                            </option>
                            <option
                              value="Cancer"
                              className="bg-gray-800 text-white"
                            >
                              Cancer
                            </option>
                            <option
                              value="Leo"
                              className="bg-gray-800 text-white"
                            >
                              Leo
                            </option>
                            <option
                              value="Virgo"
                              className="bg-gray-800 text-white"
                            >
                              Virgo
                            </option>
                            <option
                              value="Libra"
                              className="bg-gray-800 text-white"
                            >
                              Libra
                            </option>
                            <option
                              value="Scorpio"
                              className="bg-gray-800 text-white"
                            >
                              Scorpio
                            </option>
                            <option
                              value="Sagittarius"
                              className="bg-gray-800 text-white"
                            >
                              Sagittarius
                            </option>
                            <option
                              value="Capricorn"
                              className="bg-gray-800 text-white"
                            >
                              Capricorn
                            </option>
                            <option
                              value="Aquarius"
                              className="bg-gray-800 text-white"
                            >
                              Aquarius
                            </option>
                            <option
                              value="Pisces"
                              className="bg-gray-800 text-white"
                            >
                              Pisces
                            </option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={house.degree}
                            onChange={(e) =>
                              updateHouse(
                                index,
                                "degree",
                                parseFloat(e.target.value)
                              )
                            }
                            className="bg-gray-800 border border-white/20 text-white rounded px-2 py-1"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === "results" && !birthChart && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <h2 className="text-2xl font-semibold mb-6">📊 Sonuçlar</h2>
              <p className="text-gray-300 mb-6">
                Henüz bir hesaplama yapılmamış.
              </p>
              <button
                onClick={() => setCurrentView("calculator")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                🆕 Yeni Hesaplama Yap
              </button>
            </div>
          )}

          {currentView === "history" && (
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
                      person_name:
                        calc.result_json?.person?.name || "Bilinmiyor",
                      birth_date: calc.result_json?.person?.birth_date || "N/A",
                    }))}
                    keyField="id"
                    sortable={true}
                    renderRow={(calculation) => [
                      <td key="name" className="p-2 border text-white">
                        {calculation.result_json?.person?.name || "Bilinmiyor"}
                      </td>,
                      <td key="date" className="p-2 border text-white">
                        {calculation.result_json?.person?.birth_date || "N/A"}
                      </td>,
                      <td key="created" className="p-2 border text-white">
                        {calculation.created_at
                          ? new Date(calculation.created_at).toLocaleDateString(
                              "tr-TR"
                            )
                          : "N/A"}
                      </td>,
                      <td key="actions" className="p-2 border">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => viewCalculation(calculation)}
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

          {currentView === "people" && (
            /* People View */
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                👥 İnsanların Gezegenleri
              </h2>

              {savedCalculations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    Henüz kayıtlı kişi bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-4">
                  <TableMaster
                    columns={databaseColumns}
                    data={savedCalculations}
                    keyField="id"
                    sortable={true}
                    pagination={true}
                    pageSize={5}
                    renderRow={(record) => [
                      <td key="id" className="p-2 border text-white">
                        {record.id?.slice(0, 8) || "N/A"}...
                      </td>,
                      <td key="name" className="p-2 border text-white">
                        {record.result_json?.person?.name || "Bilinmiyor"}
                      </td>,
                      <td key="birth_date" className="p-2 border text-white">
                        {record.result_json?.person?.birth_date || "N/A"}
                      </td>,
                      <td key="birth_time" className="p-2 border text-white">
                        {record.result_json?.person?.birth_time || "N/A"}
                      </td>,
                      <td key="birth_place" className="p-2 border text-white">
                        {record.result_json?.person?.birth_place || "N/A"}
                      </td>,
                      <td
                        key="planets_count"
                        className="p-2 border text-purple-300"
                      >
                        {record.result_json?.planet_positions?.length || 0}
                      </td>,
                      <td key="created_at" className="p-2 border text-white">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString("tr-TR")
                          : "N/A"}
                      </td>,
                      <td key="actions" className="p-2 border">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => loadCalculation(record)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                            disabled={!record.result_json?.person}
                          >
                            👁️ Detay
                          </button>
                          <button
                            onClick={() => deleteCalculation(record.id)}
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

          {currentView === "planets" && (
            /* Planets Analysis View */
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                🪐 Gezegenlerin İnsanları
              </h2>

              {/* Gezegen Seçimi */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <label className="block text-sm font-medium text-white mb-2">
                  Gezegen Seçin:
                </label>
                <select
                  value={selectedPlanet}
                  onChange={(e) => setSelectedPlanet(e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                >
                  <option value="">Tüm Gezegenler</option>
                  {getAllPlanets().map((planet) => (
                    <option key={planet} value={planet}>
                      {planet}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtrelenmiş Kişiler */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  {selectedPlanet
                    ? `${selectedPlanet} Gezegenine Sahip Kişiler`
                    : "Tüm Kişiler"}
                </h3>

                {savedCalculations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300">
                      Henüz kayıtlı kişi bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedPlanet
                      ? getPlanetFilteredPeople(selectedPlanet)
                      : savedCalculations
                    ).map((record) => (
                      <div
                        key={record.id}
                        className="bg-white/10 p-4 rounded-lg border border-white/20"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">
                              {record.result_json?.person?.name || "Bilinmiyor"}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">
                                  Doğum Tarihi:
                                </span>
                                <div className="text-white">
                                  {record.result_json?.person?.birth_date ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Doğum Saati:
                                </span>
                                <div className="text-white">
                                  {record.result_json?.person?.birth_time ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Doğum Yeri:
                                </span>
                                <div className="text-white">
                                  {record.result_json?.person?.birth_place ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Gezegen Sayısı:
                                </span>
                                <div className="text-purple-300">
                                  {record.result_json?.planet_positions
                                    ?.length || 0}
                                </div>
                              </div>
                            </div>

                            {/* Seçili gezegenin pozisyonu */}
                            {selectedPlanet &&
                              record.result_json?.planet_positions && (
                                <div className="mt-3 p-3 bg-purple-900/30 rounded-lg">
                                  <h5 className="text-purple-300 font-semibold mb-2">
                                    {selectedPlanet} Pozisyonu:
                                  </h5>
                                  {record.result_json.planet_positions
                                    .filter(
                                      (planet) =>
                                        planet.planet_name === selectedPlanet
                                    )
                                    .map((planet, index) => (
                                      <div key={index} className="text-sm">
                                        <span className="text-gray-400">
                                          Burç:
                                        </span>{" "}
                                        {planet.sign} |
                                        <span className="text-gray-400 ml-2">
                                          Derece:
                                        </span>{" "}
                                        {planet.degree}° |
                                        <span className="text-gray-400 ml-2">
                                          Ev:
                                        </span>{" "}
                                        {planet.house_number}. Ev
                                      </div>
                                    ))}
                                </div>
                              )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => loadCalculation(record)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                              disabled={!record.result_json?.person}
                            >
                              👁️ Detay
                            </button>
                            <button
                              onClick={() => deleteCalculation(record.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === "houses" && (
            /* Houses Analysis View */
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                🏠 Evlerin İnsanları
              </h2>

              {/* Ev Seçimi */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <label className="block text-sm font-medium text-white mb-2">
                  Ev Seçin:
                </label>
                <select
                  value={selectedHouse}
                  onChange={(e) => setSelectedHouse(e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                >
                  <option value="">Tüm Evler</option>
                  {getAllHouses().map((house) => (
                    <option key={house} value={house}>
                      {house}. Ev
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtrelenmiş Kişiler */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  {selectedHouse
                    ? `${selectedHouse}. Eve Sahip Kişiler`
                    : "Tüm Kişiler"}
                </h3>

                {savedCalculations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300">
                      Henüz kayıtlı kişi bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedHouse
                      ? getHouseFilteredPeople(selectedHouse)
                      : savedCalculations
                    ).map((record) => (
                      <div
                        key={record.id}
                        className="bg-white/10 p-4 rounded-lg border border-white/20"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">
                              {record.result_json?.person?.name || "Bilinmiyor"}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">
                                  Doğum Tarihi:
                                </span>
                                <div className="text-white">
                                  {record.result_json?.person?.birth_date ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Doğum Saati:
                                </span>
                                <div className="text-white">
                                  {record.result_json?.person?.birth_time ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Doğum Yeri:
                                </span>
                                <div className="text-white">
                                  {record.result_json?.person?.birth_place ||
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Ev Sayısı:
                                </span>
                                <div className="text-indigo-300">
                                  {record.result_json?.house_positions
                                    ?.length || 0}
                                </div>
                              </div>
                            </div>

                            {/* Seçili evin pozisyonu */}
                            {selectedHouse &&
                              record.result_json?.house_positions && (
                                <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg">
                                  <h5 className="text-indigo-300 font-semibold mb-2">
                                    {selectedHouse}. Ev Pozisyonu:
                                  </h5>
                                  {record.result_json.house_positions
                                    .filter(
                                      (house) =>
                                        house.house_number ===
                                        parseInt(selectedHouse)
                                    )
                                    .map((house, index) => (
                                      <div key={index} className="text-sm">
                                        <span className="text-gray-400">
                                          Burç:
                                        </span>{" "}
                                        {house.sign} |
                                        <span className="text-gray-400 ml-2">
                                          Derece:
                                        </span>{" "}
                                        {house.degree}°
                                      </div>
                                    ))}
                                </div>
                              )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => loadCalculation(record)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                              disabled={!record.result_json?.person}
                            >
                              👁️ Detay
                            </button>
                            <button
                              onClick={() => deleteCalculation(record.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
