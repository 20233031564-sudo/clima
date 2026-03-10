const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherDataDiv = document.getElementById('weatherData');
const errorDiv = document.getElementById('error');
const historyDiv = document.getElementById("history");
const myLocationBtn = document.getElementById("myLocation");
// ⛅ Sua API KEY aqui:
const API_KEY = '36cbd44c7482f73178977c837667bdd8'; 
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let marker;
// Converter Kelvin para Celsius
function kelvinToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(1);
}

// Exibir os dados do clima
function displayWeather(data) {
  const { name, main, weather } = data;
  weatherDataDiv.innerHTML = `
    <h2>${name}</h2>
    <p>Temperatura: ${kelvinToCelsius(main.temp)}°C</p>
    <p>Umidade: ${main.humidity}%</p>
    <p>Clima: ${weather[0].description}</p>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="Ícone do clima" />
  `;
  const lat = data.coord.lat;
const lon = data.coord.lon;

map.setView([lat, lon], 10);

if (marker) {
  marker.remove();
}

marker = L.marker([lat, lon]).addTo(map);
}

// Salvar no localStorage
function saveWeatherData(city, data) {
  localStorage.setItem(city.toLowerCase(), JSON.stringify(data));
}

// Verificar localStorage
function getStoredWeatherData(city) {
  const data = localStorage.getItem(city.toLowerCase());
  return data ? JSON.parse(data) : null;
}
function saveCityHistory(city) {
  let history = JSON.parse(localStorage.getItem("cityHistory")) || [];

  history = history.filter(c => c !== city);
  history.unshift(city);

  if (history.length > 5) {
    history.pop();
  }

  localStorage.setItem("cityHistory", JSON.stringify(history));
  displayHistory();
}
function displayHistory() {
  const history = JSON.parse(localStorage.getItem("cityHistory")) || [];

  historyDiv.innerHTML = "<h3>Últimas cidades:</h3>";

  history.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;

    btn.addEventListener("click", () => {
      getWeatherData(city);
    });

    historyDiv.appendChild(btn);
  });
}
// Obter os dados da API
async function getWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Cidade não encontrada');
    const data = await response.json();
    displayWeather(data);
    saveWeatherData(city, data);
    saveCityHistory(city);
    errorDiv.textContent = '';
  } catch (error) {
    errorDiv.textContent = error.message;
    weatherDataDiv.innerHTML = '';
  }
}

// Evento de envio do formulário
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  const savedData = getStoredWeatherData(city);
  if (savedData) {
    displayWeather(savedData);
    console.log('Dados carregados do localStorage.');
  } else {
    getWeatherData(city);
  }

  cityInput.value = '';
});
displayHistory();
myLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada pelo navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      displayWeather(data);
    } catch (error) {
      errorDiv.textContent = "Erro ao obter localização.";
    }
  });
});