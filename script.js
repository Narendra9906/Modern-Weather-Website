const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/onecall';
const geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct';

const modeToggle = document.getElementById('modeToggle');
const container = document.querySelector('.container1');

modeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

document.querySelector('.searchbox_button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(latitude, longitude);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

document.getElementById('searchbox_input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = e.target.value;
        fetchGeoData(city);
    }
});

async function fetchGeoData(city) {
    try {
        const response = await fetch(`${geoApiUrl}?q=${city}&limit=1&appid=${apiKey}`);
        const data = await response.json();
        if (data.length) {
            const { lat, lon } = data[0];
            fetchWeatherData(lat, lon);
        } else {
            alert('City not found.');
        }
    } catch (error) {
        console.error('Error fetching geo data:', error);
    }
}

async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`${weatherApiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateWeatherUI(data) {
    document.getElementById('cityName').innerText = data.timezone;
    const dateTime = new Date(data.current.dt * 1000);
    document.getElementById('dateTime').innerText = `${dateTime.toLocaleTimeString()} \n ${dateTime.toLocaleDateString()}`;
    document.getElementById('temperature').innerText = `${data.current.temp}°C`;
    document.getElementById('feelsLike').innerText = `Feels like: ${data.current.feels_like}°C`;
    document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`;
    document.getElementById('weatherDescription').innerText = data.current.weather[0].description;
    document.getElementById('humidity').innerText = `${data.current.humidity}%`;
    document.getElementById('windSpeed').innerText = `${data.current.wind_speed}km/h`;
    document.getElementById('pressure').innerText = `${data.current.pressure}hPa`;
    document.getElementById('uv').innerText = data.current.uvi;
    document.getElementById('sunrise').innerText = new Date(data.current.sunrise * 1000).toLocaleTimeString();
    document.getElementById('sunset').innerText = new Date(data.current.sunset * 1000).toLocaleTimeString();

    const fiveDayForecast = document.getElementById('fiveDayForecast');
    fiveDayForecast.innerHTML = '';
    data.daily.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${day.weather[0].description}</p>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
            <p>${day.temp.day}°C</p>
            <p>${date.toLocaleDateString()}</p>
        `;
        fiveDayForecast.appendChild(forecastItem);
    });

    const hourlyForecast = document.getElementById('hourlyForecast');
    hourlyForecast.innerHTML = '';
    data.hourly.slice(0, 24).forEach(hour => {
        const date = new Date(hour.dt * 1000);
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${date.getHours()}:00</p>
            <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weather Icon">
            <p>${hour.temp}°C</p>
            <p>${hour.wind_speed}km/h</p>
        `;
        hourlyForecast.appendChild(forecastItem);
    });
}
