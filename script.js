const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const weatherSection = document.getElementById("weatherSection");
const emptyState = document.getElementById("emptyState");

const statusMessage = document.getElementById("statusMessage");

const cityName = document.getElementById("cityName");
const dateTime = document.getElementById("dateTime");

const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription = document.getElementById("weatherDescription");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const precipitation = document.getElementById("precipitation");
const pressure = document.getElementById("pressure");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const forecastContainer = document.getElementById("forecast");
const sunDot = document.getElementById("sunDot");


/* --------------------------------
   Weather code mapping
-------------------------------- */

const weatherCodes = {

    0: {
        icon: "☀️",
        text: "Clear sky"
    },

    1: {
        icon: "🌤️",
        text: "Mainly clear"
    },

    2: {
        icon: "⛅",
        text: "Partly cloudy"
    },

    3: {
        icon: "☁️",
        text: "Overcast"
    },

    45: {
        icon: "🌫️",
        text: "Fog"
    },

    48: {
        icon: "🌫️",
        text: "Depositing rime fog"
    },

    51: {
        icon: "🌦️",
        text: "Light drizzle"
    },

    53: {
        icon: "🌦️",
        text: "Moderate drizzle"
    },

    55: {
        icon: "🌧️",
        text: "Dense drizzle"
    },

    61: {
        icon: "🌦️",
        text: "Light rain"
    },

    63: {
        icon: "🌧️",
        text: "Moderate rain"
    },

    65: {
        icon: "🌧️",
        text: "Heavy rain"
    },

    71: {
        icon: "🌨️",
        text: "Light snow"
    },

    73: {
        icon: "🌨️",
        text: "Moderate snow"
    },

    75: {
        icon: "❄️",
        text: "Heavy snow"
    },

    80: {
        icon: "🌦️",
        text: "Light rain showers"
    },

    81: {
        icon: "🌧️",
        text: "Rain showers"
    },

    82: {
        icon: "⛈️",
        text: "Violent rain showers"
    },

    95: {
        icon: "⛈️",
        text: "Thunderstorm"
    },

    96: {
        icon: "⛈️",
        text: "Thunderstorm with hail"
    },

    99: {
        icon: "⛈️",
        text: "Severe thunderstorm"
    }
};


/* --------------------------------
   Search city
-------------------------------- */

searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchCity();
    }

});


async function searchCity() {

    const city = cityInput.value.trim();

    if (!city) {

        showStatus(
            "Please enter a city name.",
            true
        );

        return;
    }

    try {

        showStatus("Finding your city...");

        searchBtn.disabled = true;

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!response.ok) {
            throw new Error("Unable to search for city.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            throw new Error(
                "City not found. Try another city."
            );

        }

        const place = data.results[0];

        await loadWeather(
            place.latitude,
            place.longitude,
            place.name,
            place.country
        );

    } catch (error) {

        showStatus(
            error.message,
            true
        );

    } finally {

        searchBtn.disabled = false;

    }
}


/* --------------------------------
   Get user's location
-------------------------------- */

locationBtn.addEventListener(
    "click",
    getUserLocation
);


function getUserLocation() {

    if (!navigator.geolocation) {

        showStatus(
            "Geolocation is not supported by your browser.",
            true
        );

        return;
    }

    showStatus(
        "Getting your location..."
    );

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            try {

                await loadWeather(
                    lat,
                    lon,
                    "Your Location",
                    ""
                );

            } catch (error) {

                showStatus(
                    error.message,
                    true
                );

            }

        },

        () => {

            showStatus(
                "Location permission was denied.",
                true
            );

        }

    );
}


/* --------------------------------
   Load weather
-------------------------------- */

async function loadWeather(
    latitude,
    longitude,
    name,
    country
) {

    showStatus(
        "Loading weather data..."
    );

    const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum" +
        "&timezone=auto" +
        "&forecast_days=7";

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Weather service is currently unavailable."
        );

    }

    const data = await response.json();

    renderWeather(
        data,
        name,
        country
    );

}


/* --------------------------------
   Render weather
-------------------------------- */

function renderWeather(
    data,
    name,
    country
) {

    const current = data.current;
    const daily = data.daily;

    const weather =
        weatherCodes[current.weather_code] ||
        weatherCodes[0];


    /* Location */

    cityName.textContent =
        country
            ? `${name}, ${country}`
            : name;


    dateTime.textContent =
        formatCurrentDate(
            data.timezone
        );


    /* Current */

    weatherIcon.textContent =
        weather.icon;

    weatherDescription.textContent =
        weather.text;


    temperature.textContent =
        Math.round(
            current.temperature_2m
        );


    feelsLike.textContent =
        Math.round(
            current.apparent_temperature
        );


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    wind.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    precipitation.textContent =
        `${current.precipitation} mm`;

    pressure.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    /* Sun */

    sunrise.textContent =
        formatTime(
            daily.sunrise[0]
        );

    sunset.textContent =
        formatTime(
            daily.sunset[0]
        );


    updateSunPosition(
        daily.sunrise[0],
        daily.sunset[0]
    );


    /* Forecast */

    forecastContainer.innerHTML = "";

    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const forecastWeather =
            weatherCodes[
                daily.weather_code[i]
            ] || weatherCodes[0];


        const card =
            document.createElement("div");

        card.className =
            "forecast-card";


        card.innerHTML = `
            <div class="forecast-day">
                ${getDayName(daily.time[i], i)}
            </div>

            <div class="forecast-icon">
                ${forecastWeather.icon}
            </div>

            <div class="forecast-temp">
                ${Math.round(daily.temperature_2m_max[i])}°
            </div>

            <div class="forecast-low">
                ${Math.round(daily.temperature_2m_min[i])}°
            </div>
        `;


        forecastContainer.appendChild(card);

    }


    /* Dynamic background */

    updateBackground(
        current.weather_code
    );


    emptyState.classList.add(
        "hidden"
    );

    weatherSection.classList.remove(
        "hidden"
    );

    showStatus(
        `Updated automatically · ${data.timezone}`
    );

}


/* --------------------------------
   Format date
-------------------------------- */

function formatCurrentDate(timezone) {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone
        }
    ).format(new Date());

}


/* --------------------------------
   Format time
-------------------------------- */

function formatTime(value) {

    const time =
        value.split("T")[1];

    let [hours, minutes] =
        time.split(":");

    hours =
        Number(hours);

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    hours =
        hours % 12 || 12;

    return `${hours}:${minutes} ${suffix}`;

}


/* --------------------------------
   Forecast day
-------------------------------- */

function getDayName(
    dateString,
    index
) {

    if (index === 0) {
        return "Today";
    }

    const date =
        new Date(
            `${dateString}T12:00:00`
        );

    return new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "short"
        }
    ).format(date);

}


/* --------------------------------
   Sun position
-------------------------------- */

function updateSunPosition(
    sunriseValue,
    sunsetValue
) {

    const sunriseTime =
        new Date(
            sunriseValue
        ).getTime();

    const sunsetTime =
        new Date(
            sunsetValue
        ).getTime();

    const now =
        Date.now();

    let percentage =
        ((now - sunriseTime) /
            (sunsetTime - sunriseTime)) * 100;


    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    sunDot.style.left =
        `${percentage}%`;

}


/* --------------------------------
   Dynamic background
-------------------------------- */

function updateBackground(code) {

    let background;


    if (code >= 95) {

        background =
            "radial-gradient(circle at top, #475569, transparent 40%), linear-gradient(135deg, #020617, #1e293b)";

    } else if (
        code >= 61 &&
        code <= 82
    ) {

        background =
            "radial-gradient(circle at top, #0ea5e9, transparent 40%), linear-gradient(135deg, #0f172a, #164e63)";

    } else if (
        code >= 1 &&
        code <= 3
    ) {

        background =
            "radial-gradient(circle at top, #60a5fa, transparent 40%), linear-gradient(135deg, #172554, #3730a3)";

    } else {

        background =
            "radial-gradient(circle at top, #f59e0b, transparent 40%), linear-gradient(135deg, #172554, #312e81)";

    }


    document.body.style.background =
        background;

}


/* --------------------------------
   Status
-------------------------------- */

function showStatus(
    message,
    isError = false
) {

    statusMessage.textContent =
        message;

    statusMessage.classList.toggle(
        "error",
        isError
    );

}
