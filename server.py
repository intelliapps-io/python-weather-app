from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib import parse
from weather import getWeatherByCords, getWeatherByZipcode

# Enhanced Server Class
class Server(BaseHTTPRequestHandler):
  # hanlde http get requests
  def do_GET(self):
    # API weather route
    if self.path.find("/api/weather") > -1:
      self.handle_api_request()
    # JS Route(s)
    elif self.path.find("/js/") > -1:
      req = self.path.split('/')[2]
      self.handle_file_request("public/js/" + req, "application/javascript")
    # CSS route
    elif self.path.find("index.css") > -1:
      self.handle_file_request("public/index.css", "text/css")
    # HTML route
    else:
      self.handle_file_request("public/index.html", "text/html")

  # API
  # params:
  #   lat?: float
  #   lon?: float
  #   zipcode?: int
  def handle_api_request(self):
    # result is data to send to client
    result = None
    # result status
    status = 200
    # content type defaulted to json from api result datatype
    contentType = "application/json"

    # retrieve url-encoded params
    qsParams = parse.parse_qs(self.path.split("?")[1])
    lat = qsParams.get("lat", None)
    lon = qsParams.get("lon", None)
    zipcode = qsParams.get("zip", None)

    # parse latitude
    if (type(lat) == list):
      try:
        lat = float(lat[0])
      except:
        lat = None
    
    # parse longitude
    if (type(lon) == list):
      try:
        lon = float(lon[0])
      except:
        lon = None

    # parse zipcode
    if (type(zipcode) == list):
      try:
        zipcode = str(zipcode[0])
      except:
        zipcode = None

    # pick api method based on provided params
    if (type(zipcode) == str):
      result = getWeatherByZipcode(zipcode)
    elif (type(lat) == float and type(lon) == float):
      result = getWeatherByCords(lat, lon)
    else:
      status = 400
      contentType = "text/html"
      result = bytes("Error! You must provide either both lat and lon or zipcode. Zipcode is prioritized over lat and lon.", "UTF-8")

    # set http headers
    self.send_response(status)
    self.send_header("Content-type", contentType)
    self.end_headers()

    # send data
    self.wfile.write(result)
    
  def handle_file_request(self, fileName, contentType):
    # content to send to client
    content = None

    # try to read file
    try:
      content = open(Path(fileName)).read()
    except:
      print("Error! \"" + fileName + "\" not found!")

    # hanlde results accordingly
    if (content == None):
      # set http headers
      self.send_response(404)
      self.send_header("Content-type", "text/html")
      self.end_headers()
      # send error
      self.wfile.write(bytes("Error! \"" + fileName + "\" not found!", "UTF-8"))

    else:
      # set http headers
      self.send_response(200)
      self.send_header("Content-type", contentType)
      self.end_headers()
      # send file
      self.wfile.write(bytes(content, "UTF-8"))