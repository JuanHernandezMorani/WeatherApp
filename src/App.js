import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Argentina");
  const [weatherData, setWeatherData] = useState(null);
  const [countriesWeather, setCountriesWeather] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 21;

  const currentDate = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedDate = `${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  const countries = [
    "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Anguila", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
    "Bahamas", "Barbados", "Bélgica", "Belice", "Bermudas", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután",
    "Cabo Verde", "Camboya", "Camerún", "Canadá", "Chad", "Chile", "China", "Chipre", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba",
    "Dinamarca", "Dominica",
    "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía",
    "Filipinas", "Finlandia", "Fiyi", "Francia",
    "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Groenlandia", "Guadalupe", "Guam", "Guatemala", "Guayana Francesa", "Guernsey", "Guinea", "Guinea Ecuatorial", "Guinea-Bisáu", "Guyana",
    "Haití", "Honduras", "Hong Kong", "Hungría",
    "India", "Indonesia", "Irak", "Irán", "Irlanda", "Isla de Man", "Islandia", "Islas Caimán", "Islas Feroe", "Islas Malvinas", "Islas Marianas del Norte", "Islas Salomón", "Islas Turcas y Caicos", "Islas Vírgenes Británicas", "Israel", "Italia",
    "Jamaica", "Japón", "Jersey", "Jordania",
    "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kosovo", "Kuwait",
    "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo",
    "Macao", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Martinica", "Mauricio", "Mauritania", "Mayotte", "México", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Montserrat", "Mozambique",
    "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Caledonia", "Nueva Zelanda",
    "Omán",
    "Países Bajos", "Pakistán", "Palaos", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polinesia Francesa", "Polonia", "Portugal", "Puerto Rico",
    "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumania", "Rusia",
    "Sahara Occidental", "Samoa", "San Bartolomé", "San Cristóbal y Nieves", "San Marino", "San Martín", "San Pedro y Miquelón", "San Vicente y las Granadinas", "Santa Elena", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Sint Maarten", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam",
    "Tailandia", "Taiwán", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu",
    "Ucrania", "Uganda", "Uruguay", "Uzbekistán",
    "Vanuatu", "Vaticano", "Venezuela", "Vietnam",
    "Wallis y Futuna",
    "Yemen",
    "Zambia", "Zimbabue"
  ];

  const API_KEY = "0ed0d590ab0be431dae989ea68749556";

  const fetchWeatherData = async (cityName = city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod === 200) {
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error(`Error fetching weather for ${cityName}:`, error.message);
      return null;
    }
  };

  const loadCountriesWeather = async () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCountries = countries.slice(startIndex, endIndex);

    const promises = pageCountries.map(country => fetchWeatherData(country));
    const results = await Promise.allSettled(promises);
    const validResults = results
      .map((res) => (res.status === "fulfilled" && res.value ? res.value : null))
      .filter(Boolean);
    setCountriesWeather(validResults);
  };

  useEffect(() => {
    fetchWeatherData().then(data => {
      if (data) setWeatherData(data);
    });
  }, []);

  useEffect(() => {
    loadCountriesWeather();
  }, [currentPage]);

  const handleInputChange = (event) => {
    setCity(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = await fetchWeatherData(city);
    if (data) setWeatherData(data);
  };

  const getWeatherIconUrl = (main) => {
    switch (main) {
      case "Clear": return "/sun.png";
      case "Clouds": return "/cloudy.png";
      case "Rain": return "/rain_with_cloud.png";
      case "Mist": return "/mist.png";
      case "Haze": return "/haze.png";
      case "Snow": return "/sun_with_snow.png";
      default: return null;
    }
  };

  const getWeatherName = (main) => {
    switch (main) {
      case "Clear": return "Sunny";
      case "Clouds": return "Cloudy";
      case "Rain": return "Rain";
      case "Mist": return "Mist";
      case "Haze": return "Haze";
      case "Snow": return "Snowing";
      default: return main;
    }
  };

  function grades (data) {
    return Math.round(data);
  }

  const totalPages = Math.ceil(countries.length / itemsPerPage);

  return (
    <div className="App">
      <div className="container">
        {weatherData && (
          <>
            <h1 className="container_date">{formattedDate}</h1>
            <div className="weather_data">
              <h2 className="container_city">{weatherData.name}</h2>
              <img
                className="container_img"
                src={getWeatherIconUrl(weatherData.weather[0].main)}
                width="180px"
                alt={`${weatherData.weather[0].main} icon`}
              />
              <h2 className="container_degree">{grades(weatherData.main.temp)} °C</h2>
              <h2 className="country_per">{getWeatherName(weatherData.weather[0].main)}</h2>
            </div>
          </>
        )}
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input"
            placeholder="Enter city name"
            value={city}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="inner-container">
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
        <div className="countries_conteiner">
          {countriesWeather.map((countryData, index) => (
            <div className="container-2" key={index}>
              <div className="weather_data">
                <h2 className="container_city">{countryData.name}</h2>
                <img
                  className="container_img"
                  src={getWeatherIconUrl(countryData.weather[0].main)}
                  width="120px"
                  alt={`${weatherData.weather[0].main} icon`}
                />
                <h2 className="container_degree">{grades(countryData.main.temp)} °C</h2>
                <h2 className="country_per">{getWeatherName(countryData.weather[0].main)}</h2>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;