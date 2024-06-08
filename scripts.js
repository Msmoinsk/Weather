const cityInput = document.querySelector(".city-input")
const searchButton = document.querySelector(".search-btn")
const locationButton = document.querySelector(".location-btn")
const currentWeatherDiv = document.querySelector(".current-weather")
const weatherCardDiv = document.querySelector(".weather-cards")

const API_KEY = `f0213289048b66d54d534b734e02d466`  // API key for OpenWeatherAPI

// section : 3 Dom data Creation
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){  // HTML for the main weather
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind : ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity : ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icons">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icons">
                    <h5>${weatherItem.weather[0].description}</h5>
                </div>`
    } else {  // HTML for the other five day forcast card
        return `<li class="cards">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icons">
                    <h4>Temp : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind : ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity : ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}

// Section : 2 This will Get the Specific Details That needed And Add to the DOM
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        
        // Filter the forecast to get only one forecast per day 
        const uniqueForecastDays = []
        const fiveDayForcast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate()
            // console.log(forecastDate)
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate)
            }
        });

        // Clearing the text inpt and the Weather data 
        cityInput.value = "";
        weatherCardDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        // Creating weather Card and Adding them to the DOM
        fiveDayForcast.forEach((weatherItem, index) => {
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)) 
            }else{
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)) 
            }
        })

    }).catch(()=>{
        alert("An Error occured while fetching the Weather Forcast")
    })
}

/* Section : 1 Calling the API and fteching the Data Requiied By user */
const getCityCoordinates = ()=>{
    // Get user entered city name and remove extra spaces
    const cityName = cityInput.value.trim() 
    // Return if cityName is empty
    if(!cityName) return 
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`
    
    // Get entered city Coordinates (latitude, Longitude and Name) from the API response 
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data=>{
        
        if(!data.length) return alert(`No Co ordinate Found for ${cityName}`)
        const { name, lat, lon } = data[0]
        getWeatherDetails(name, lat, lon)

    }).catch(()=>{
        alert("An Error occured while fetching the coordinate")
    })
}

// Section User Location
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords

            // Getting City name from coordinates using reverse geocoding API
            const REVERSE_GROCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            fetch(REVERSE_GROCODING_URL).then(res => res.json()).then(data=>{
        
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
        
            }).catch(()=>{
                alert("An Error occured while fetching the City")
            })
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again")
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    )
}

// Start from here for Understanding
locationButton.addEventListener("click", getUserCoordinates)
searchButton.addEventListener("click", getCityCoordinates)
cityInput.addEventListener("keyup", (event) => {
        event.key === "Enter" && getCityCoordinates()
})