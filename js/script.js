// mapping "own" icons from openweathermap icons
const ICON_MAPPING = {
	"skc": "images/clear_day.svg",
	"few": "images/partly_cloudy_day.svg",
	"sct": "images/partly_cloudy_day.svg",
	"bkn": "images/cloud.svg",
	"ovc": "images/partly_cloudy_night.svg",
	"wind_skc": "images/windy.svg",
	"wind_few": "images/windy.svg",
	"wind_sct": "images/windy.svg",
	"wind_bkn": "images/windy.svg",
	"wind_ovc": "images/windy.svg",
	"snow": "images/snowflake.svg",
	"rain_snow": "images/rainy_snow.svg",
	"rain_sleet": "images/rainy.svg",
	"snow_sleet": "images/snowflake.svg", // stopped here
	"fzra": "images/partly_cloudy_night.svg",
	"rain_fzra": "images/partly_cloudy_night.svg",
	"snow_fzra": "images/partly_cloudy_night.svg",
	"sleet": "images/partly_cloudy_night.svg",
	"rain": "images/rainy.svg", // done
	"rain_showers": "images/partly_cloudy_night.svg",
	"rain_showers_hi": "images/partly_cloudy_night.svg",
	"tsra": "images/thunderstorm.svg", // done
	"tsra_sct": "images/thunderstorm.svg", // done
	"tsra_hi": "images/thunderstorm.svg", // done
	"tornado": "images/partly_cloudy_night.svg",
	"hurricane": "images/partly_cloudy_night.svg",
	"tropical_storm": "images/partly_cloudy_night.svg",
	"dust": "images/partly_cloudy_night.svg",
	"smoke": "images/partly_cloudy_night.svg",
	"haze": "images/partly_cloudy_night.svg",
	"hot": "images/partly_cloudy_night.svg",
	"cold": "images/partly_cloudy_night.svg",
	"blizzard": "images/partly_cloudy_night.svg",
	"fog": "images/foggy.svg" // done
}

// function to get the mapping from the image url
function getIconCode(url) {
	const imageUrl = new URL(url);
	let pathname = imageUrl.pathname;
	// console.log(pathname);
	// Extract the relevant part of the path
	const urlParts = pathname.split('/');
	// console.log(urlParts);
	let iconCode = urlParts[urlParts.length - 1].split(',')[0]; // Get the part before any ","
	// console.log(iconCode);
	return iconCode;
}

// Example usage:
// const url = "https://api.weather.gov/icons/land/night/ovc?size=medium";
// const result = getPathAfterLastSlash(url);
// console.log(result); // Output: ovc

// if (navigator.geolocation) {
// 	navigator.geolocation.getCurrentPosition(showPosition, showError);
// } else {
// 	alert("Geolocation is not supported by this browser.");
// }

// function showPosition(position) {
// 	const latitude = position.coords.latitude;
// 	const longitude = position.coords.longitude;

// 	// Now, use latitude and longitude to fetch weather data
// 	fetchWeatherData(latitude, longitude);
// }

// function showError(error) {
// 	console.log("Geolocation error:", error);
// 	// Handle the error (e.g., display a message to the user)
// }

const DEFAULT_COORDS = {
	latitude: 38.0336,
	longitude: -81.0827
};

async function getUserLocation() {
	return new Promise((resolve) => {
		// Check if geolocation is even supported by the browser
		if (!navigator.geolocation) {
			console.warn("Geolocation not supported. Using defaults.");
			return resolve(DEFAULT_COORDS);
		}

		navigator.geolocation.getCurrentPosition(
			// SUCCESS CALLBACK
			(position) => {
				console.log("Location access granted.");
				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				});
			},
			// ERROR CALLBACK (This is where we handle the decline)
			(error) => {
				switch (error.code) {
					case error.PERMISSION_DENIED:
						console.warn("User denied location access. Using defaults.");
						break;
					case error.POSITION_UNAVAILABLE:
						console.warn("Location information unavailable. Using defaults.");
						break;
					case error.TIMEOUT:
						console.warn("The request timed out. Using defaults.");
						break;
					case error.UNKNOWN_ERROR:
						console.warn("An unknown error occurred. Using defaults.");
						break;
				}
				// Regardless of the error, we resolve with our default values
				resolve(DEFAULT_COORDS);
			},
			{
				enableHighAccuracy: true,
				timeout: 5000, // Stop trying after 5 seconds
				maximumAge: 0
			}
		);
	});
}

async function fetchWeatherData(latitude, longitude) {
	const weatherUrl = `https://api.weather.gov/points/${latitude},${longitude}`;
	try {
		const weatherResponse = await fetch(weatherUrl);
		// const weatherResponse = await fetch(weatherUrl, {
		// 	headers: {
		// 		'User-Agent': '(kylekeller.dev/projects/nws-data, contact@myweatherapp.com)'
		// 		}
		// });

		// Check if the request was successful
		if (!weatherResponse.ok) {
			throw new Error(`HTTP error! status: ${weatherResponse.status}`);
		}

		const weatherData = await weatherResponse.json(); // Parses JSON response into a JS object

		let forecastData = '';
		if (weatherData.properties.forecast) {
			const forecastResponse = await fetch(weatherData.properties.forecast);
			if (!forecastResponse.ok) {
				throw new Error(`HTTP error! status: ${forecastResponse.status}`);
			}
			forecastData = await forecastResponse.json();
		}

		// get observation station api
		let obsStationData = '';
		if (weatherData.properties.observationStations) {
			const obsStationResponse = await fetch(weatherData.properties.observationStations);
			if (!obsStationResponse.ok) {
				throw new Error(`HTTP error! status: ${obsStationResponse.status}`);
			}
			obsStationData = await obsStationResponse.json();
		}

		// output observation station data - 0 will get closest station
		// let obsStationId = '';
		// let obsStationName = '';
		// if (obsStationData && obsStationData.length) {
			const obsStationId = obsStationData.features[0].properties.stationIdentifier;
			const obsStationName = obsStationData.features[0].properties.name;
			console.log(obsStationId);
			console.log(obsStationName);
		// }

		// get latest observation api
		let latestObsData = '';
		if (obsStationId) {
			const latestObsResponse = await fetch(`https://api.weather.gov/stations/${obsStationId}/observations/latest`);
			if (!latestObsResponse.ok) {
				throw new Error(`HTTP error! status: ${latestObsResponse.status}`);
			}
			latestObsData = await latestObsResponse.json();
		}

		// output forcast station data
		// for (i = 0; i <= 13; i++) {
		// 	let day = forecastData.properties.periods[i];

		// 	let date = day.startTime;
		// 	let getTemp = day.temperature;
		// 	console.log(date + ': ' + getTemp);
		// }

		const data = [];

		// DO I EVEN NEED ANY OF THESE???
		let date = '';
		let currCity = '';
		let currState = '';
		let weatherIcon = '';
		let description = '';
		let temp = '';
		let sunrise = '';
		let sunset = '';
		let heatIndex = ''; // seems to always be null
		let windSpeed = '';
		let windDirection = '';
		let humidity = '';
		let dayHighLow = '';

		// data for all the days
		// number of periods
		const getDays = forecastData.properties.periods.length;
		// console.log(getDays);
		for (i = 0; i < getDays; i++) {
			const day = forecastData.properties.periods[i];
			date = day.startTime.split('T')[0]; // 2026-04-24T15:00:00-05:00 iso string -> 2026-04-24
			date = new Date(date); // Convert to Date object
			const formattedDate = date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				timeZone: 'UTC' // Optional: use UTC to ensure timezone offsets don't change the day
			});

			// get high and low
			if (day.temperature) {
				dayHighLow = day.temperature;
			}

			// get icon
			// confirm that this icon matches what latestObsData.properties.icon would have gave me
			if (day.icon) {
				weatherIcon = day.icon;
			}

			data.push({
				date: formattedDate,
				dayHighLow: dayHighLow,
				weatherIcon: weatherIcon
			});
		}

		// data for just the first day
		if (weatherData.properties.relativeLocation.properties.city != 'null'
			&& weatherData.properties.relativeLocation.properties.state != 'null' ) { // could this be something else besides null?
			currCity = weatherData.properties.relativeLocation.properties.city;
			currState = weatherData.properties.relativeLocation.properties.state;
		}

		// getting today's weather icon just to conpare with daily forecast
		if (latestObsData.properties.icon != 'null') {
			todayIcon = latestObsData.properties.icon;
		}

		if (latestObsData.properties.textDescription != 'null') {
			description = latestObsData.properties.textDescription;
		}

		// get lastest temp from latest obs response
		if (latestObsData) { // is this enough or should it be checking for value?...same goes for the above
			temp = latestObsData.properties.temperature.value;
			temp = (temp * 9/5) + 32;
		}

		if (weatherData) { // update this condition
			sunrise = weatherData.properties.astronomicalData.sunrise;
			sunrise = new Date(sunrise);
			sunrise = sunrise.toLocaleTimeString('en-US', {
				hour12: true,
				hour: 'numeric',
				minute: 'numeric'
				// second: 'numeric'
			});
			sunset = weatherData.properties.astronomicalData.sunset;
			sunset = new Date(sunset);
			sunset = sunset.toLocaleTimeString('en-US', {
				hour12: true,
				hour: 'numeric',
				minute: 'numeric'
				// second: 'numeric'
			});

		}

		if (latestObsData.properties.heatIndex.value) {
			heatIndex = latestObsData.properties.heatIndex.value;
		}

		if (latestObsData.properties.windSpeed.value) {
			windSpeed = latestObsData.properties.windSpeed.value;
		}

		if (latestObsData.properties.relativeHumidity.value) {
			humidity = latestObsData.properties.relativeHumidity.value;
		}

		if (latestObsData.properties.windDirection.value) {
			windDirection = latestObsData.properties.windDirection.value;
		}

		// add only to only "today"
		data[0] = Object.assign(data[0], {
			currCity: currCity,
			currState: currState,
			obsStationId: obsStationId,
			obsStationName: obsStationName,
			todayIcon: todayIcon, // remove after testing... maybe leave since it's showing "at this moment"???
			description: description,
			temp: temp,
			sunrise: sunrise,
			sunset: sunset,
			heatIndex: heatIndex,
			windSpeed: windSpeed,
			windDirection: windDirection,
			humidity: humidity
		});

		// console.log(data);

		function groupByDate(arr) {
			const grouped = {};

			for (const item of arr) {
				const date = item.date;
				if (!grouped[date]) {
					grouped[date] = [];
				}
				grouped[date].push(item);
			}

			return grouped;
		}

		const groupedData = groupByDate(data);
		// console.log(JSON.stringify(groupedData, null, 2));

		// testing
		// document.getElementById('data-output').innerHTML = JSON.stringify(data, null, 2);

		// outputData(data);
		outputData(groupedData);

	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
	}
}

// ---------- go over

// function getWindDirection(degrees) {
// 	const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// 	// Normalize degrees to be within 0-360 range
// 	let normalizedDegrees = ((degrees %= 360) < 0) ? degrees + 360 : degrees;

// 	// Divide by 45 (360/8) and round to find index
// 	const index = Math.round(normalizedDegrees / 45) % 8;

// 	return directions[index];
// }

function getWindDirection(degrees) {
	const directions = [
	"N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", 
	"S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
	];

	// Standard 16-point compass calculation
	const index = Math.floor((degrees / 22.5) + 0.5) % 16;

	return directions[index];
}

// ----------

function outputData(groupedData) {
	const locationInfo = document.createDocumentFragment();
	const todaysForecast = document.createDocumentFragment();

	const getToday = groupedData[Object.keys(groupedData)[0]][0];
	// console.log(getToday);

	// location data
	if (getToday.obsStationId) {
		const stationId = document.createElement('span');
		stationId.classList.add('station-id');
		stationId.innerHTML = `<b>Observation station ID:</b> ${getToday.obsStationId}`;
		locationInfo.appendChild(stationId);
	}

	if (getToday.obsStationName) {
		const stationName = document.createElement('span');
		stationName.classList.add('station-name');
		stationName.innerHTML = `<b>Observation station name:</b> ${getToday.obsStationName}`;
		locationInfo.appendChild(stationName);
	}

	// all done with location info
	if (locationInfo.children.length) {
		document.getElementById('station-info').appendChild(locationInfo);
	}

	// get today forecast data
	if (getToday.date) {
		const todaysDate = document.createElement('h3');
		todaysDate.classList.add('date');
		todaysDate.textContent = getToday.date;
		todaysForecast.appendChild(todaysDate);
	}

	if (getToday.currCity && getToday.currState) {
		const location = document.createElement('span');
		location.classList.add('location');
		location.textContent = `${getToday.currCity}, ${getToday.currState}`;
		todaysForecast.appendChild(location);
	}

	const iconContainer = document.createElement('div');
	iconContainer.classList.add('icon-container');
	if (getToday.todayIcon) { // update to weatherIcon when done testing
		const forecastIcon = document.createElement('img');
		forecastIcon.classList.add('weather-icon');
		const iconCode = `${ICON_MAPPING[getIconCode(getToday.todayIcon)]}`;
		// forecastIcon.src = `${getToday.weatherIcon}`; // if not using icon mapping
		forecastIcon.src = `${iconCode}`; // add fallback image
		forecastIcon.alt = `Weather icon for ${getToday.date}.`;
		// forecastIcon.setAttribute('data-icon', getToday.weatherIcon);
		iconContainer.appendChild(forecastIcon);
		todaysForecast.appendChild(iconContainer);
	}

	if (getToday.description) {
		const weatherDescription = document.createElement('span');
		weatherDescription.classList.add('decription');
		weatherDescription.textContent = `${getToday.description}`;
		// todaysForecast.appendChild(weatherDescription);
		iconContainer.appendChild(weatherDescription);
	}

	if (getToday.temp) {
		const currTemp = document.createElement('span');
		currTemp.classList.add('curr-temp');
		currTemp.textContent = `${getToday.temp.toFixed(0)}°F`;
		todaysForecast.appendChild(currTemp);
	}

	if (getToday.sunrise && getToday.sunset) {
		const sunriseSpan = document.createElement('span');
		sunriseSpan.classList.add('sunrise');
		sunriseSpan.textContent = `Sunrise: ${getToday.sunrise}`;
		todaysForecast.appendChild(sunriseSpan);

		const sunsetSpan = document.createElement('span');
		sunsetSpan.classList.add('sunset');
		sunsetSpan.textContent = `Sunset: ${getToday.sunset}`;
		todaysForecast.appendChild(sunsetSpan);
	}

	// figure this out - what is heat index and what's it's units?
	if (getToday.heatIndex) {
		const feelsLike = document.createElement('span');
		feelsLike.classList.add('feels-like');
		feelsLike.textContent = `Feels like: ${getToday.heatIndex.toFixed(0)}°`;
		todaysForecast.appendChild(feelsLike);
	}

	if (getToday.windSpeed) {
		const windSpeed = document.createElement('span');
		windSpeed.classList.add('wind-speed');
		const windSpeedConvert = getToday.windSpeed * 0.621371; // convert to km/h -> mph
		windSpeed.textContent = `Wind speed: ${windSpeedConvert.toFixed(0)} mph`;
		todaysForecast.appendChild(windSpeed);
	}

	if (getToday.windDirection) {
		const windDirection = document.createElement('span');
		windDirection.classList.add('wind-direction');
		const getDirection = getWindDirection(getToday.windDirection);
		windDirection.textContent = `Wind direction: ${getToday.windDirection}° ${getDirection}`;
		todaysForecast.appendChild(windDirection);
	}

	if (getToday.humidity) {
		const humidity = document.createElement('span');
		humidity.classList.add('humidity');
		humidity.textContent = `Humidity: ${getToday.humidity.toFixed(0)}%`;
		todaysForecast.appendChild(humidity);
	}

	// all done with today's forecast
	if (todaysForecast.children.length) {
		document.getElementById('todays-forecast').appendChild(todaysForecast);
	}

	// 7 day forecast
	const sevenForecast = document.createDocumentFragment();

	Object.entries(groupedData).forEach(([date, dailyData]) => {
		// console.log(JSON.stringify(dailyData, null, 2));
		const forecastContainer = document.createElement('div');
		forecastContainer.classList.add('forecast-container');

		if (dailyData[0].date) {
			const forecastDate = document.createElement('h3');
			forecastDate.classList.add('date');
			forecastDate.textContent = date;
			forecastContainer.appendChild(forecastDate);
		}

		// this is only getting one of the images...
		if (dailyData[0].weatherIcon) {
			const forecastIcon = document.createElement('img');
			forecastIcon.classList.add('weather-icon');
			const iconCode = `${ICON_MAPPING[getIconCode(dailyData[0].weatherIcon)]}`;
			// forecastIcon.src = dailyData[0].weatherIcon; // if not using icon mapping
			forecastIcon.src = `${iconCode}`; // add fallback image
			forecastIcon.alt = `Weather icon for ${dailyData[0].date}.`;
			// forecastIcon.setAttribute('data-icon', dailyData[0].weatherIcon);
			forecastContainer.appendChild(forecastIcon);
		}

		// high/low temps
		if (dailyData[0].dayHighLow) {
			const tempsContainer = document.createElement('div');
			tempsContainer.classList.add('temps-container');

			const temp = document.createElement('span');
			temp.classList.add('temp');
			temp.textContent = `${dailyData[0].dayHighLow}°F`;

			const tempLabel = document.createElement('span');
			tempLabel.classList.add('high');
			tempLabel.textContent = 'H: ';

			temp.prepend(tempLabel);
			tempsContainer.appendChild(temp);

			forecastContainer.appendChild(tempsContainer);

			// having this nested is wrong, you can have a low without a high...
			if (dailyData.length > 1 && dailyData[1].dayHighLow) {
				const temp = document.createElement('span');
				temp.classList.add('temp');
				temp.textContent = `${dailyData[1].dayHighLow}°F`;

				const tempLabel = document.createElement('span');
				tempLabel.classList.add('low');
				tempLabel.textContent = 'L: ';

				temp.prepend(tempLabel);
				tempsContainer.appendChild(temp);
			}
		}

		// append forecastContainer to sevenForecast
		sevenForecast.appendChild(forecastContainer);
	});

	if (sevenForecast.children.length) {
		document.getElementById('seven-forecast').appendChild(sevenForecast);
	}
};

// toggle for station info
const infoToggle = document.getElementById('toggle-info');
const stationInfo = document.getElementById('station-info');
infoToggle.addEventListener('click', function() {
	if (stationInfo.classList.contains('active')) {
		this.setAttribute('aria-expanded', 'false');
		stationInfo.classList.remove('active');
		stationInfo.setAttribute('aria-hidden', 'true');
	} else {
		this.setAttribute('aria-expanded', 'true');
		stationInfo.classList.add('active');
		stationInfo.setAttribute('aria-hidden', 'false');
	}
});

async function initApp() {
	console.log("Fetching location...");

	const coords = await getUserLocation();

	// The rest of your app doesn't care if the data is real or default
	fetchWeatherData(coords.latitude, coords.longitude);
}

initApp();