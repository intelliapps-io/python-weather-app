// Application State Variables
let LOADING = false
let LOCATION_USED = false
let LOCATION_ERROR = false
let ZIPCODE_USED = false

/////////////////
// Geolocation //
/////////////////

// Get Geolocation
function getLocation(): Promise<Position> {
  // create promise
  return new Promise((resolve, reject) => {
    // resolve with position data and reject with error
    navigator.geolocation.getCurrentPosition((pos) => resolve(pos), (err) => reject(err))
  })
}

// Handle Location Failure
function onLocationFailed(err: Error) {
  // show element
  document.getElementById('location-failed')!.style.setProperty('display', 'flex')
}

///////////////////
// Fetch Weather //
///////////////////

// openweathermap.org weather api result 
interface WeatherResult {
  coord: { lon: number, lat: number },
  weather: Array<{ id: number, main: string, description: string, icon: string }>,
  base: string,
  main: { temp: number, feels_like: number, temp_min: number, temp_max: number, pressure: number, humidity: number },
  wind: { speed: number, deg: number, gust?: number },
  clouds: { all: number },
  dt: number,
  sys: { type: number, id: number, message: number, country: string, sunrise: number, sunset: number },
  timezone: number,
  id: number,
  name: string,
  cod: number
}

const fetchWeather = (
  method: 'coord' | 'zipcode',
  args: {
    lat?: number,
    lon?: number,
    zipcode?: number
  }
): Promise<WeatherResult> => new Promise((resolve, reject) => {
  // query string
  let qs: string | null = null

  // choose api based on method
  if (method === 'coord' && args.lat && args.lon)
    qs = `${document.baseURI}api/weather?lat=${args.lat}&lon=${args.lon}`
  else if (method === 'zipcode' && args.zipcode)
    qs = `${document.baseURI}api/weather?zip=${args.zipcode}`

  // set loading
  setLoading(true)

  if (qs)
    fetch(qs)
      // return api result parsed as json
      .then(result => {
        // parse JSON results
        result.text().then(text => resolve(JSON.parse(text)))
        // set loading to false
        setLoading(false)
      })
      // reject api error
      .catch(err => reject(err))
  else
    // reject if args not provided
    reject(new Error('"coord" requires both lat and lon arguments, "zipcode" requires zipcode argument.'))
})

////////////////
// Webpage UI //
////////////////

const handleZipcodeSearch = async () => {
  //@ts-ignore get html input element value
  const zipcode = document.getElementById('zipcode-search')!.value

  // dismiss location denied, if displayed
  document.getElementById('location-failed')!.style.setProperty('display', 'none')

  // get weather data and await for api result
  const result = await fetchWeather('zipcode', { zipcode })
    // show user error on api failure
    .catch((err) => window.alert(err.message))

  // if data then update webpage
  if (result)
    displayWeather(result)
}

const setLoading = (state: boolean) => {
  if (state) {
    LOADING = true
    document.getElementById('loading')!.style.setProperty('display', 'inherit')
    document.getElementById('weather-wrapper')!.style.setProperty('display', 'none')

  } else {
    LOADING = false
    document.getElementById('loading')!.style.setProperty('display', 'none')
    document.getElementById('weather-wrapper')!.style.setProperty('display', 'inherit')
  }
}

function displayWeather(data: WeatherResult) {
  // get element by id or return temp element
  const el = (id: string): HTMLElement => {
    const el = document.getElementById(id)
    if (el) return el
    else return document.getElementById('temp') as any
  }

  // convert kelvin to fahrenheit
  const convertTempToF = (temp: number) => `${Math.round(((temp - 273.15) * 9 / 5 + 32))} °F`

  // set html data
  el('city-name').innerText = data.name

  // weather card
  el('current-temp').innerText = convertTempToF(data.main.temp)
  el('feels-temp').innerText = convertTempToF(data.main.feels_like)
  el('max-temp').innerText = convertTempToF(data.main.temp_max)
  el('min-temp').innerText = convertTempToF(data.main.temp_min)

  // wind and air card
  el('wind-speed').innerText = data.wind.speed + " mph"
  el('wind-deg').innerText = `${data.wind.deg}°` + " of North"
  el('wind-gust').innerText = data.wind.gust ? data.wind.gust + "mph" : "na"
  el('humidity').innerText = data.main.humidity + " %"
  el('pressure').innerText = data.main.pressure + " hPa"

  // set weather icon
  el('weather-icon').setAttribute('src', `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
}


///////////////////
// Main Function //
///////////////////
const main = async () => {
  // get user location via HTML5 location api
  const location = await getLocation().catch(err => onLocationFailed(err))

  // if user allows location
  if (location) {
    // get weather data and await for api result
    const result = await fetchWeather('coord', { lat: location.coords.latitude, lon: location.coords.longitude })
      // show user error on api failure
      .catch((err) => window.alert(err.message))

    // if data then update webpage
    if (result)
      displayWeather(result)
  }
}

// exec main
main()