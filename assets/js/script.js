const part1 = '16bd7d7b24929ae';
const part2 = '6342abe92608dbded';
const cityInput = document.getElementById('cityInput');
const weatherInfo = document.getElementById('weatherInfo');

function searchWeatherData() {
    const city = cityInput.value.trim();
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${part1 + part2}`;

    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherInfo(data);
            saveToLocalStorage(city);
            displaySearchHistory();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            if (weatherInfo) {
                weatherInfo.textContent = 'City not found. Please try again.';
            }
        });
}

function displayWeatherInfo(data) {
    const cityName = data.city.name;
    const forecastList = data.list;

    const groupedForecast = {};
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toDateString();
        if (!groupedForecast[date]) {
            groupedForecast[date] = {
                date: date,
                icon: forecast.weather[0].icon,
                temperatureFahrenheit: ((forecast.main.temp - 273.15) * 9/5 + 32).toFixed(2),
                windSpeedMPH: (forecast.wind.speed * 2.23694).toFixed(2),
                humidity: forecast.main.humidity
            };
        }
    });

    let forecastHTML = '';

    const currentDate = new Date().toDateString();
    forecastHTML += `<div class="forecast-item current-day">
                        <p>Date: ${currentDate}</p>
                        <img src="https://openweathermap.org/img/wn/${groupedForecast[currentDate].icon}.png" alt="Weather Icon">
                        <p>Temperature: ${groupedForecast[currentDate].temperatureFahrenheit} °F</p>
                        <p>Wind Speed: ${groupedForecast[currentDate].windSpeedMPH} MPH</p>
                        <p>Humidity: ${groupedForecast[currentDate].humidity}%</p>
                    </div>`;

    const futureDates = Object.keys(groupedForecast).filter(date => date !== currentDate).slice(0, 5);
    futureDates.forEach(date => {
        forecastHTML += `<div class="forecast-item">
                            <p>Date: ${date}</p>
                            <img src="https://openweathermap.org/img/wn/${groupedForecast[date].icon}.png" alt="Weather Icon">
                            <p>Temperature: ${groupedForecast[date].temperatureFahrenheit} °F</p>
                            <p>Wind Speed: ${groupedForecast[date].windSpeedMPH} MPH</p>
                            <p>Humidity: ${groupedForecast[date].humidity}%</p>
                        </div>`;
    });

    if (weatherInfo) {
        weatherInfo.innerHTML = forecastHTML;
    } else {
        console.error('Error: weatherInfo element not found.');
    }

    document.querySelectorAll('.forecast-item').forEach(item => {
        item.addEventListener('click', function() {
            console.log('Clicked on forecast item:', item);
        });
    });
}

function saveToLocalStorage(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function displaySearchHistory() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyList = document.getElementById('searchHistory');

    if (!historyList) {
        console.error('Error: searchHistory element not found.');
        return;
    }

    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const item = document.createElement('li');
        item.textContent = city;
        item.classList.add('search-history-item');
        historyList.appendChild(item);
    });
}

function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
}

window.onbeforeunload = function() {
    clearSearchHistory();
};

window.addEventListener('load', displaySearchHistory);
document.getElementById('searchBtn').addEventListener('click', searchWeatherData);