# 🪐 Astroloji App – Microservice Based Architecture

Bu proje, astroloji doğum haritası hesaplama ve yönetimi için **microservice tabanlı, scalable, provider-independent** bir sistemdir.



## **Amaç**

✅ Kişilerin doğum bilgilerini kaydetmek  
✅ Gezegen pozisyonlarını ve ev konumlarını hesaplayıp kaydetmek  
✅ Frontend üzerinden CRUD ve filtreleme yapmak  
✅ Provider bağımsız çalışmak (AstrologyAPI, Swiss Ephemeris, Astronomia, Scraper)


## **Proje Yapısı**

astroloji-app/
┣ services/
┃ ┣ astrology-api-adapter/
┃ ┣ astronomia-calculator/
┃ ┣ swiss-ephemeris-calculator/
┃ ┣ scraper-adapter/
┣ gateway/
┣ frontend/
┣ README.md
┗ docker-compose.yml

- **services/**: Her provider için ayrı microservice
- **gateway/**: API Gateway (CORS çözümü, provider abstraction)
- **frontend/**: React tabanlı UI + Supabase database integration


## 🔧 **Microservice Strategy**

- Her calculation service **standardized JSON schema** döner.
- Migration / provider değişimi frontend kodunu etkilemez.

### **Standard API Response Schema**

json
{
"status": "success",
"data": {
"person": { "name": "", "birth_date": "", "birth_time": "", "birth_place": "" },
"planet_positions": [
{ "planet": "", "sign": "", "degree": 0, "house": 0 }
],
"houses": [
{ "house_number": 1, "sign": "", "degree": 0 }
]
}
}
⚙️ Kurulum

1. Repo clone et

git clone <repo-url>
cd astroloji-app

2. Frontend setup

cd frontend
npm install
npm run dev

3. Her microservice setup
   Örneğin:

cd services/astrology-api-adapter
npm install
npm run dev

🐳 Docker Compose
Tüm servisleri localde aynı anda ayağa kaldırmak için:

docker-compose up --build
(docker-compose.yml yapılandırması ilerleyen sprintlerde hazırlanacak.)

📝 Notlar
Frontend Supabase kullanır (database + auth + storage).

Microservisler Railway, Render gibi platformlarda ayrı ayrı deploy edilir.

API Gateway tüm provider çağrılarını tek endpointte toplar.

© 2025 Kadir Akar
