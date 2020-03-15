import urllib.request

API_KEY = "e581647c6b94dcfae653a168718968e4"

def getWeatherByCords(lat: float, lon: float):
  URL = "http://api.openweathermap.org/data/2.5/weather?lat=" + str(lat) + "&lon=" + str(lon) + "&appid=" + API_KEY
  data = None
  with urllib.request.urlopen(URL) as response:
    data = response.read()
  return data

def getWeatherByZipcode(zipcode: int):
  URL = "http://api.openweathermap.org/data/2.5/weather?zip=" + str(zipcode) + "&appid=" + API_KEY
  data = None
  with urllib.request.urlopen(URL) as response:
    data = response.read()
  return data