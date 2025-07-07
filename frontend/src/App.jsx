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
  const [selectedSign, setSelectedSign] = useState("");
  const [selectedHousePlanet, setSelectedHousePlanet] = useState("");
  const [chartSVG, setChartSVG] = useState(null);
  // Elle gezegen ekleme için state
  const [manualPlanets, setManualPlanets] = useState([]);
  const [manualPlanetForm, setManualPlanetForm] = useState({
    name: "",
    sign: "ARIES",
    degree: "",
    minute: "",
    house: "",
    longitude: "",
  });
  // Elle görsel yükleme için state
  const [manualChartImage, setManualChartImage] = useState(null);
  // Harita düzenleme paneli için state
  const [showChartEdit, setShowChartEdit] = useState(false); // Başlangıçta kapalı
  // Supabase görsel URL state
  const [chartImageUrl, setChartImageUrl] = useState(null);
  // Yükleme durumu
  const [imageUploading, setImageUploading] = useState(false);
  // Yükleme hatası
  const [imageUploadError, setImageUploadError] = useState(null);
  // Dosya seçimi için state
  const [pendingChartFile, setPendingChartFile] = useState(null);

  // Yeni insan ekle formu için görsel seçimi
  const [newPersonChartFile, setNewPersonChartFile] = useState(null);
  const [newPersonImageUploading, setNewPersonImageUploading] = useState(false);
  const [newPersonImageUploadError, setNewPersonImageUploadError] =
    useState(null);

  // Elle görsel yükleme handler
  const handleManualChartImage = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setManualChartImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Lütfen JPG veya PNG formatında bir dosya seçin.");
    }
  };

  // Elle görseli sil
  const handleManualChartImageDelete = () => {
    setManualChartImage(null);
  };

  // Harita görseli yükle ve Supabase'a kaydet
  const handleSupabaseChartImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !(file.type === "image/jpeg" || file.type === "image/png")) {
      alert("Lütfen JPG veya PNG formatında bir dosya seçin.");
      return;
    }
    if (!birthChart || !birthChart.id) {
      alert("Kayıt id bulunamadı. Lütfen önce haritayı kaydedin.");
      return;
    }
    setImageUploading(true);
    setImageUploadError(null);
    try {
      const url = await birthChartService.uploadChartImageAndSaveUrl(
        birthChart.id,
        file
      );
      setChartImageUrl(url);
      setManualChartImage(null); // local yüklemeyi sıfırla
    } catch (err) {
      setImageUploadError("Görsel yüklenemedi.");
    } finally {
      setImageUploading(false);
    }
  };

  // Görseli sil (frontend'den) -- eski fonksiyonu kaldırıyorum
  // const handleChartImageUrlDelete = () => {
  //   setChartImageUrl(null);
  // };

  // Dosya seçildiğinde state'e al
  const handlePendingChartFile = (e) => {
    const file = e.target.files[0];
    if (!file || !(file.type === "image/jpeg" || file.type === "image/png")) {
      alert("Lütfen JPG veya PNG formatında bir dosya seçin.");
      return;
    }
    setPendingChartFile(file);
  };

  // Kaydet butonu: dosya seçildiyse Supabase'a yükle
  const handleSaveChartImage = async () => {
    if (!pendingChartFile) {
      alert("Lütfen önce bir dosya seçin.");
      return;
    }
    if (!birthChart || !birthChart.id) {
      alert("Kayıt id bulunamadı. Lütfen önce haritayı kaydedin.");
      return;
    }
    setImageUploading(true);
    setImageUploadError(null);
    try {
      const url = await birthChartService.uploadChartImageAndSaveUrl(
        birthChart.id,
        pendingChartFile
      );
      setChartImageUrl(url);
      setManualChartImage(null);
      setPendingChartFile(null);
    } catch (err) {
      setImageUploadError("Görsel yüklenemedi.");
    } finally {
      setImageUploading(false);
    }
  };

  // Supabase Storage'dan ve tablodan görseli sil
  const handleChartImageUrlDelete = async () => {
    if (!birthChart || !birthChart.id || !chartImageUrl) {
      setChartImageUrl(null);
      return;
    }
    setImageUploading(true);
    setImageUploadError(null);
    try {
      // Storage'dan sil
      await birthChartService.deleteChartImageFromStorage(chartImageUrl);
      // Tabloyu güncelle
      await birthChartService.removeChartImageUrl(birthChart.id);
      setChartImageUrl(null);
    } catch (err) {
      setImageUploadError("Görsel silinemedi.");
    } finally {
      setImageUploading(false);
    }
  };

  // Otomatik hesapla (SVG'ye dön)
  const handleAutoChart = () => {
    setChartImageUrl(null);
    setShowChartEdit(false);
  };

  // birthChart değişince chart_image_url state'ini güncelle
  useEffect(() => {
    if (birthChart && birthChart.chart_image_url) {
      setChartImageUrl(birthChart.chart_image_url);
    } else {
      setChartImageUrl(null);
    }
  }, [birthChart]);

  // Load saved calculations on component mount
  useEffect(() => {
    console.log("App component mounted"); // Debug log
    loadSavedCalculations();
  }, []);

  // Elle gezegen ekle
  const handleManualPlanetAdd = (e) => {
    e.preventDefault();
    if (
      !manualPlanetForm.name ||
      !manualPlanetForm.sign ||
      manualPlanetForm.degree === "" ||
      manualPlanetForm.house === "" ||
      manualPlanetForm.longitude === ""
    )
      return;
    setManualPlanets((prev) => [...prev, { ...manualPlanetForm }]);
    setManualPlanetForm({
      name: "",
      sign: "ARIES",
      degree: "",
      minute: "",
      house: "",
      longitude: "",
    });
  };

  // Elle gezegen sil
  const handleManualPlanetDelete = (idx) => {
    setManualPlanets((prev) => prev.filter((_, i) => i !== idx));
  };

  // SVG'yi yükle (birthChart değişince)
  useEffect(() => {
    const fetchSVG = async () => {
      if (!birthChart) return;
      // house_cusps normalize et, eksik longitude'ları doldur
      let house_cusps = [];
      if (birthChart.house_cusps && birthChart.house_cusps.length === 12) {
        house_cusps = birthChart.house_cusps.map((h, i) => ({
          house: h.house || h.house_number || i + 1,
          sign: h.sign,
          degree: h.degree,
          minute: h.minute || 0,
          longitude: h.longitude !== undefined ? h.longitude : (i * 30) % 360,
          label: h.label || undefined,
        }));
      } else if (birthChart.houses && birthChart.houses.length === 12) {
        house_cusps = birthChart.houses.map((h, i) => ({
          house: h.house || h.house_number || i + 1,
          sign: h.sign,
          degree: h.degree,
          minute: h.minute || 0,
          longitude: h.longitude !== undefined ? h.longitude : (i * 30) % 360,
          label: h.label || undefined,
        }));
      }
      const svgData = {
        ...birthChart,
        house_cusps,
        aspects: birthChart.aspects || [],
      };
      try {
        const response = await fetch("/api/render-natal-chart-svg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(svgData),
        });
        if (response.ok) {
          const svgText = await response.text();
          setChartSVG(svgText);
        } else {
          setChartSVG(null);
        }
      } catch (err) {
        setChartSVG(null);
      }
    };
    fetchSVG();
  }, [birthChart]);

  // SVG'yi yükle (elle eklenen gezegenler değişince)
  useEffect(() => {
    if (manualPlanets.length === 0) return;
    const fetchSVG = async () => {
      const svgData = {
        planet_positions: manualPlanets.map((p) => ({
          name: p.name,
          sign: p.sign,
          degree: Number(p.degree),
          minute: Number(p.minute) || 0,
          house: Number(p.house),
          longitude: Number(p.longitude),
        })),
        house_cusps: [], // elle ekleme için şimdilik boş
        aspects: [], // elle ekleme için şimdilik boş
      };
      try {
        const response = await fetch("/api/render-natal-chart-svg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(svgData),
        });
        if (response.ok) {
          const svgText = await response.text();
          setChartSVG(svgText);
        } else {
          setChartSVG(null);
        }
      } catch (err) {
        setChartSVG(null);
      }
    };
    fetchSVG();
  }, [manualPlanets]);

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
    if (name === "birthDate") {
      // Sadece rakam ve / karakterine izin ver
      const formatted = value.replace(/[^0-9/]/g, "");
      // Otomatik olarak / ekle
      let auto = formatted;
      if (auto.length === 2 && formData.birthDate.length === 1) auto += "/";
      if (auto.length === 5 && formData.birthDate.length === 4) auto += "/";
      setFormData((prev) => ({ ...prev, [name]: auto }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNewPersonImageUploading(false);
    setNewPersonImageUploadError(null);

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
      // Save to Supabase
      const savedRecord = await birthChartService.saveCalculation(
        formData,
        birthChartData
      );
      // id ve chart_image_url'yi state'e ekle
      setBirthChart({
        ...birthChartData,
        id: savedRecord.id,
        chart_image_url: savedRecord.chart_image_url,
      });
      // Eğer görsel seçildiyse, yükle
      if (newPersonChartFile) {
        setNewPersonImageUploading(true);
        try {
          await birthChartService.uploadChartImageAndSaveUrl(
            savedRecord.id,
            newPersonChartFile
          );
          // Yükleme sonrası güncel kaydı tekrar çek
          const updatedRecord = await birthChartService.getCalculationById(
            savedRecord.id
          );
          setBirthChart({
            ...birthChartData,
            id: updatedRecord.id,
            chart_image_url: updatedRecord.chart_image_url,
          });
        } catch (err) {
          setNewPersonImageUploadError("Görsel yüklenemedi.");
        } finally {
          setNewPersonImageUploading(false);
          setNewPersonChartFile(null);
        }
      }
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
      // Dummy kaydı da Supabase'a kaydet ve id'yi ekle
      try {
        const savedRecord = await birthChartService.saveCalculation(
          formData,
          dummyData
        );
        setBirthChart({
          ...dummyData,
          id: savedRecord.id,
          chart_image_url: savedRecord.chart_image_url,
        });
        // Eğer görsel seçildiyse, yükle
        if (newPersonChartFile) {
          setNewPersonImageUploading(true);
          try {
            await birthChartService.uploadChartImageAndSaveUrl(
              savedRecord.id,
              newPersonChartFile
            );
            // Yükleme sonrası güncel kaydı tekrar çek
            const updatedRecord = await birthChartService.getCalculationById(
              savedRecord.id
            );
            setBirthChart({
              ...dummyData,
              id: updatedRecord.id,
              chart_image_url: updatedRecord.chart_image_url,
            });
          } catch (err) {
            setNewPersonImageUploadError("Görsel yüklenemedi.");
          } finally {
            setNewPersonImageUploading(false);
            setNewPersonChartFile(null);
          }
        }
        await loadSavedCalculations();
      } catch (saveError) {
        console.error("Error saving to Supabase:", saveError);
        setBirthChart(dummyData); // id olmadan fallback
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCalculation = (calculation) => {
    const resultData = calculation.result_json;
    if (resultData?.person) {
      setFormData(resultData.person);
      // id ve chart_image_url'yi state'e ekle
      setBirthChart({
        ...resultData,
        id: calculation.id,
        chart_image_url: calculation.chart_image_url,
      });
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

      // Find the current calculation in savedCalculations to get its ID
      const currentCalculation = savedCalculations.find(
        (calc) =>
          calc.result_json?.person?.name === birthChart.person.name &&
          calc.result_json?.person?.birth_date ===
            birthChart.person.birth_date &&
          calc.result_json?.person?.birth_time === birthChart.person.birth_time
      );

      if (currentCalculation) {
        // Update in Supabase
        await birthChartService.updateCalculation(
          currentCalculation.id,
          updatedData
        );

        // Reload saved calculations to get updated data
        await loadSavedCalculations();

        // Update local state
        setBirthChart(updatedData);
        setEditingResults(false);

        alert("Sonuçlar başarıyla güncellendi!");
      } else {
        alert("Güncellenecek kayıt bulunamadı!");
      }
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

      // Find the current calculation in savedCalculations to get its ID
      const currentCalculation = savedCalculations.find(
        (calc) =>
          calc.result_json?.person?.name === birthChart.person.name &&
          calc.result_json?.person?.birth_date ===
            birthChart.person.birth_date &&
          calc.result_json?.person?.birth_time === birthChart.person.birth_time
      );

      if (currentCalculation) {
        // Update in Supabase
        await birthChartService.updateCalculation(
          currentCalculation.id,
          updatedData
        );

        // Reload saved calculations to get updated data
        await loadSavedCalculations();

        // Update local state
        setBirthChart(updatedData);
        setEditingPerson(false);

        alert("Kişi bilgileri başarıyla güncellendi!");
      } else {
        alert("Güncellenecek kayıt bulunamadı!");
      }
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
        (planet) => planet.planet === planetName
      )
    );
  };

  const getHouseFilteredPeople = (houseNumber) => {
    return savedCalculations.filter((calc) =>
      calc.result_json?.houses?.some(
        (house) => house.house_number === parseInt(houseNumber)
      )
    );
  };

  const getAllPlanets = () => {
    const planets = new Set();
    console.log("savedCalculations:", savedCalculations); // Debug log

    // Eğer veritabanında veri yoksa, sabit gezegen listesi göster
    if (savedCalculations.length === 0) {
      return [
        "Sun",
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
      ];
    }

    savedCalculations.forEach((calc) => {
      console.log("calc.result_json:", calc.result_json); // Debug log
      if (calc.result_json?.planet_positions) {
        console.log(
          "planet_positions found:",
          calc.result_json.planet_positions
        ); // Debug log
        calc.result_json.planet_positions.forEach((planet) => {
          console.log("planet:", planet); // Debug log
          planets.add(planet.planet);
        });
      }
    });
    const result = Array.from(planets).sort();
    console.log("All planets found:", result); // Debug log
    return result;
  };

  const getAllHouses = () => {
    const houses = new Set();
    savedCalculations.forEach((calc) => {
      calc.result_json?.houses?.forEach((house) => {
        houses.add(house.house_number);
      });
    });
    return Array.from(houses).sort((a, b) => a - b);
  };

  // Yeni: Seçili gezegene sahip kişilerin burçlarını döndür
  const getAllSignsForPlanet = (planetName) => {
    const signs = new Set();
    console.log("getAllSignsForPlanet called with planetName:", planetName); // Debug log

    // Eğer veritabanında veri yoksa, sabit burç listesi göster
    if (savedCalculations.length === 0) {
      return [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
      ];
    }

    savedCalculations.forEach((calc) => {
      if (calc.result_json?.planet_positions) {
        calc.result_json.planet_positions.forEach((planet) => {
          console.log(
            "checking planet:",
            planet.planet,
            "against:",
            planetName
          ); // Debug log
          if (!planetName || planet.planet === planetName) {
            console.log("adding sign:", planet.sign); // Debug log
            signs.add(planet.sign);
          }
        });
      }
    });
    const result = Array.from(signs).sort();
    console.log("All signs found:", result); // Debug log
    return result;
  };
  // Yeni: Hem gezegen hem burç filtreli kişiler
  const getPlanetSignFilteredPeople = (planetName, sign) => {
    return savedCalculations.filter((calc) =>
      calc.result_json?.planet_positions?.some(
        (planet) =>
          (!planetName || planet.planet === planetName) &&
          (!sign || planet.sign === sign)
      )
    );
  };

  // Yeni: Hem ev hem gezegen filtreli kişiler
  const getHousePlanetFilteredPeople = (houseNumber, planetName) => {
    return savedCalculations.filter((calc) =>
      calc.result_json?.planet_positions?.some(
        (planet) =>
          (!houseNumber || planet.house === parseInt(houseNumber)) &&
          (!planetName || planet.planet === planetName)
      )
    );
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
    { key: "name", label: "Ad Soyad", sortable: true },
    { key: "birth_date", label: "Doğum Tarihi", sortable: true },
    { key: "birth_time", label: "Doğum Saati", sortable: true },
    { key: "birth_place", label: "Doğum Yeri", sortable: true },
    { key: "actions", label: "İşlemler", sortable: false },
  ];

  // Yeni insan ekle formunda dosya seçimi handler'ı
  const handleNewPersonChartFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!(file.type === "image/jpeg" || file.type === "image/png")) {
      alert("Lütfen JPG veya PNG formatında bir dosya seçin.");
      return;
    }
    setNewPersonChartFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🪐 Astroloji App
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 px-2">
            Doğum haritanızı hesaplayın ve gezegen pozisyonlarınızı keşfedin
          </p>

          {/* Ana Sayfa Butonu */}
          {currentView !== "dashboard" && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105"
              >
                🏠 Ana Sayfaya Dön
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentView === "dashboard" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-white">
                🪐 Astroloji Analiz Merkezi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Yeni İnsan Ekle */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👤</div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Yeni İnsan Ekle
                    </h3>
                    <p className="text-purple-100 mb-3 sm:mb-4 text-sm sm:text-base">
                      Yeni bir kişi için doğum haritası hesapla
                    </p>
                    <button
                      onClick={() => setCurrentView("calculator")}
                      className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm sm:text-base"
                    >
                      Hesaplamaya Başla
                    </button>
                  </div>
                </div>

                {/* İnsanların Gezegenleri */}
                <div className="bg-gradient-to-br from-green-600 to-teal-600 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👥</div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      İnsanların Gezegenleri
                    </h3>
                    <p className="text-green-100 mb-3 sm:mb-4 text-sm sm:text-base">
                      Kişilerin gezegen pozisyonlarını görüntüle
                    </p>
                    <button
                      onClick={() => setCurrentView("people")}
                      className="bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-sm sm:text-base"
                    >
                      Kişileri Görüntüle
                    </button>
                  </div>
                </div>

                {/* Gezegenlerin İnsanları */}
                <div className="bg-gradient-to-br from-orange-600 to-red-600 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🪐</div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Gezegenlerin İnsanları
                    </h3>
                    <p className="text-orange-100 mb-3 sm:mb-4 text-sm sm:text-base">
                      Aynı gezegene sahip kişileri filtrele
                    </p>
                    <button
                      onClick={() => setCurrentView("planets")}
                      className="bg-white text-orange-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm sm:text-base"
                    >
                      Gezegen Analizi
                    </button>
                  </div>
                </div>

                {/* Evlerin İnsanları */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏠</div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Evlerin İnsanları
                    </h3>
                    <p className="text-indigo-100 mb-3 sm:mb-4 text-sm sm:text-base">
                      Aynı eve sahip kişileri filtrele
                    </p>
                    <button
                      onClick={() => setCurrentView("houses")}
                      className="bg-white text-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-sm sm:text-base"
                    >
                      Ev Analizi
                    </button>
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {savedCalculations.length}
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">
                    Toplam Kişi
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                    12
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">
                    Gezegen Pozisyonu
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                    12
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">
                    Ev Pozisyonu
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "calculator" && (
            <>
              {/* Birth Chart Form */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-white/20">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                  Doğum Bilgileri
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      type="text"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      placeholder="GG/AA/YYYY"
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

                  {/* Doğum haritası görseli yükleme alanı */}
                  <div className="flex flex-col items-center mt-2">
                    <label className="mb-1 text-white font-semibold">
                      Doğum Haritası Görseli (JPG/PNG):
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleNewPersonChartFile}
                      className="mb-1"
                      disabled={newPersonImageUploading}
                    />
                    {newPersonChartFile && (
                      <div className="mb-1 text-green-300 text-sm">
                        Seçilen dosya: {newPersonChartFile.name}
                      </div>
                    )}
                    {newPersonImageUploading && (
                      <div className="text-yellow-400 mb-1">Yükleniyor...</div>
                    )}
                    {newPersonImageUploadError && (
                      <div className="text-red-400 mb-1">
                        {newPersonImageUploadError}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              {/* Haritayı Düzenle Butonu */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowChartEdit((v) => !v)}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
                >
                  {showChartEdit ? "Kapat" : "Haritayı Düzenle"}
                </button>
              </div>
              {/* Harita Düzenleme Paneli */}
              {showChartEdit && (
                <div className="mb-6 flex flex-col items-center bg-white/10 p-4 rounded-lg border border-white/20 w-full max-w-lg mx-auto">
                  <label className="mb-2 text-white font-semibold">
                    Doğum Haritası Görseli Yükle (JPG/PNG, Supabase):
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePendingChartFile}
                    className="mb-2"
                    disabled={imageUploading}
                  />
                  {pendingChartFile && (
                    <div className="mb-2 text-green-300 text-sm">
                      Seçilen dosya: {pendingChartFile.name}
                    </div>
                  )}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={handleSaveChartImage}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                      disabled={imageUploading || !pendingChartFile}
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={handleChartImageUrlDelete}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                      disabled={imageUploading || !chartImageUrl}
                    >
                      Sil
                    </button>
                    <button
                      onClick={handleAutoChart}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                    >
                      Otomatik Hesapla
                    </button>
                  </div>
                  {imageUploading && (
                    <div className="text-yellow-400 mb-2">
                      İşlem yapılıyor...
                    </div>
                  )}
                  {imageUploadError && (
                    <div className="text-red-400 mb-2">{imageUploadError}</div>
                  )}
                  {chartImageUrl && (
                    <img
                      src={chartImageUrl}
                      alt="Yüklenen Doğum Haritası"
                      className="w-full max-w-xs sm:max-w-md md:max-w-lg rounded-lg shadow-lg border border-white/20 bg-white/10 mb-2"
                    />
                  )}
                </div>
              )}
              {/* SVG veya Yüklenen Görsel */}
              {!chartImageUrl ? (
                <div className="flex justify-center mb-6">
                  {chartSVG ? (
                    <div
                      className="w-full max-w-xs sm:max-w-md md:max-w-lg rounded-lg shadow-lg border border-white/20 bg-white/10"
                      dangerouslySetInnerHTML={{ __html: chartSVG }}
                    />
                  ) : (
                    <div className="text-gray-400">SVG yükleniyor...</div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <img
                    src={chartImageUrl}
                    alt="Yüklenen Doğum Haritası"
                    className="w-full max-w-xs sm:max-w-md md:max-w-lg rounded-lg shadow-lg border border-white/20 bg-white/10"
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  📊 Doğum Haritası Sonuçları
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {editingResults ? (
                    <>
                      <button
                        onClick={saveResultsEdit}
                        disabled={loading}
                        className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        {loading ? "🔄 Kaydediliyor..." : "💾 Kaydet"}
                      </button>
                      <button
                        onClick={cancelResultsEdit}
                        disabled={loading}
                        className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        ❌ İptal
                      </button>
                    </>
                  ) : editingPerson ? (
                    <>
                      <button
                        onClick={savePersonEdit}
                        disabled={loading}
                        className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        {loading ? "🔄 Kaydediliyor..." : "💾 Kaydet"}
                      </button>
                      <button
                        onClick={cancelPersonEdit}
                        disabled={loading}
                        className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        ❌ İptal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startEditingResults}
                        className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        ✏️ Sonuçları Düzenle
                      </button>
                      <button
                        onClick={startEditingPerson}
                        className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        👤 Kişi Bilgilerini Düzenle
                      </button>
                      <button
                        onClick={() => setCurrentView("calculator")}
                        className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        🆕 Yeni Hesaplama
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Person Info */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 sm:mb-4">
                  👤 Kişi Bilgileri
                </h3>
                {editingPerson ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
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
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold mb-3 sm:mb-4">
                  🪐 Gezegen Pozisyonları
                </h3>
                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  {editingResults ? (
                    <div className="space-y-2">
                      {editingPlanets.map((planet, index) => (
                        <div
                          key={planet.planet}
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-3 bg-white/5 rounded-lg"
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
                <h3 className="text-lg font-semibold mb-3 sm:mb-4">
                  🏠 Ev Pozisyonları
                </h3>
                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  {editingResults ? (
                    <div className="space-y-2">
                      {editingHouses.map((house, index) => (
                        <div
                          key={house.house_number}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-3 bg-white/5 rounded-lg"
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
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                📚 Hesaplama Geçmişi
              </h2>

              {savedCalculations.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-300">
                    Henüz kaydedilmiş hesaplama bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
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
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() => viewCalculation(calculation)}
                            className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs sm:text-sm"
                          >
                            👁️ Görüntüle
                          </button>
                          <button
                            onClick={() => deleteCalculation(calculation.id)}
                            className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs sm:text-sm"
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
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                👥 İnsanların Gezegenleri
              </h2>

              {savedCalculations.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-300">
                    Henüz kayıtlı kişi bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {savedCalculations.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => loadCalculation(record)}
                      className="w-full bg-gradient-to-br from-purple-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <div className="text-3xl mb-2">👤</div>
                      <div className="font-bold text-lg mb-1">
                        {record.result_json?.person?.name || "Bilinmiyor"}
                      </div>
                      <div className="text-sm text-purple-200">
                        {record.result_json?.person?.birth_date || "N/A"}
                      </div>
                      <div className="text-sm text-purple-200">
                        {record.result_json?.person?.birth_place || "N/A"}
                      </div>
                    </button>
                  ))}
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
              {/* Gezegen ve Burç Seçimi */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <SelectField
                    label="Gezegen Seçin:"
                    name="planet"
                    value={selectedPlanet}
                    onChange={(e) => {
                      setSelectedPlanet(e.target.value);
                      setSelectedSign(""); // gezegen değişince burç sıfırlansın
                    }}
                    options={[
                      { id: "", label: "Tüm Gezegenler" },
                      ...getAllPlanets().map((planet) => ({
                        id: planet,
                        label: planet,
                      })),
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <SelectField
                    label="Burç Seçin:"
                    name="sign"
                    value={selectedSign}
                    onChange={(e) => setSelectedSign(e.target.value)}
                    options={[
                      { id: "", label: "Tüm Burçlar" },
                      ...getAllSignsForPlanet(selectedPlanet).map((sign) => ({
                        id: sign,
                        label: sign,
                      })),
                    ]}
                  />
                </div>
              </div>
              {/* Filtrelenmiş Kişiler */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  {selectedPlanet || selectedSign
                    ? `${selectedPlanet ? selectedPlanet + " " : ""}${
                        selectedSign ? selectedSign + " burcuna sahip " : ""
                      }kişiler`
                    : "Tüm Kişiler"}
                </h3>
                {savedCalculations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300">
                      Henüz kayıtlı kişi bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <TableMaster
                    columns={databaseColumns}
                    data={getPlanetSignFilteredPeople(
                      selectedPlanet,
                      selectedSign
                    )}
                    keyField="id"
                    sortable={true}
                    pagination={true}
                    pageSize={5}
                    renderRow={(record) => [
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

              {/* Ev ve Gezegen Seçimi */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <SelectField
                    label="Ev Seçin:"
                    name="house"
                    value={selectedHouse}
                    onChange={(e) => {
                      setSelectedHouse(e.target.value);
                      setSelectedHousePlanet(""); // ev değişince gezegen sıfırlansın
                    }}
                    options={[
                      { id: "", label: "Tüm Evler" },
                      ...getAllHouses().map((house) => ({
                        id: house.toString(),
                        label: `${house}. Ev`,
                      })),
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <SelectField
                    label="Gezegen Seçin:"
                    name="housePlanet"
                    value={selectedHousePlanet}
                    onChange={(e) => setSelectedHousePlanet(e.target.value)}
                    options={[
                      { id: "", label: "Tüm Gezegenler" },
                      ...getAllPlanets().map((planet) => ({
                        id: planet,
                        label: planet,
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* Filtrelenmiş Kişiler */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  {selectedHouse || selectedHousePlanet
                    ? `${selectedHouse ? selectedHouse + ". evde " : ""}${
                        selectedHousePlanet
                          ? selectedHousePlanet + " gezegenine sahip "
                          : ""
                      }kişiler`
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
                    {getHousePlanetFilteredPeople(
                      selectedHouse,
                      selectedHousePlanet
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
                                  {record.result_json?.houses?.length || 0}
                                </div>
                              </div>
                            </div>

                            {/* Seçili evdeki gezegenler */}
                            {selectedHouse &&
                              record.result_json?.planet_positions && (
                                <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg">
                                  <h5 className="text-indigo-300 font-semibold mb-2">
                                    {selectedHouse}. Evdeki Gezegenler:
                                  </h5>
                                  {record.result_json.planet_positions
                                    .filter(
                                      (planet) =>
                                        planet.house === parseInt(selectedHouse)
                                    )
                                    .map((planet, index) => (
                                      <div
                                        key={index}
                                        className={`text-sm mb-1 ${
                                          selectedHousePlanet &&
                                          planet.planet === selectedHousePlanet
                                            ? "bg-yellow-900/50 p-2 rounded"
                                            : ""
                                        }`}
                                      >
                                        <span className="text-yellow-300">
                                          🪐 {planet.planet}
                                        </span>{" "}
                                        |
                                        <span className="text-gray-400 ml-2">
                                          Burç:
                                        </span>{" "}
                                        {planet.sign} |
                                        <span className="text-gray-400 ml-2">
                                          Derece:
                                        </span>{" "}
                                        {planet.degree}°
                                        {selectedHousePlanet &&
                                          planet.planet ===
                                            selectedHousePlanet && (
                                            <span className="ml-2 text-green-300">
                                              ✓ Seçili
                                            </span>
                                          )}
                                      </div>
                                    ))}
                                  {record.result_json.planet_positions.filter(
                                    (planet) =>
                                      planet.house === parseInt(selectedHouse)
                                  ).length === 0 && (
                                    <div className="text-sm text-gray-400">
                                      Bu evde gezegen bulunmuyor.
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Seçili evin pozisyonu */}
                            {selectedHouse && record.result_json?.houses && (
                              <div className="mt-3 p-3 bg-blue-900/30 rounded-lg">
                                <h5 className="text-blue-300 font-semibold mb-2">
                                  {selectedHouse}. Ev Pozisyonu:
                                </h5>
                                {record.result_json.houses
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
          <p>© 2025 Astroloji App - Kadir Akar</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
