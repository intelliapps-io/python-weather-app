"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Application State Variables
var LOADING = false;
var LOCATION_USED = false;
var LOCATION_ERROR = false;
var ZIPCODE_USED = false;
/////////////////
// Geolocation //
/////////////////
// Get Geolocation
function getLocation() {
    // create promise
    return new Promise(function (resolve, reject) {
        // resolve with position data and reject with error
        navigator.geolocation.getCurrentPosition(function (pos) { return resolve(pos); }, function (err) { return reject(err); });
    });
}
// Handle Location Failure
function onLocationFailed(err) {
    // show element
    document.getElementById('location-failed').style.setProperty('display', 'flex');
}
var fetchWeather = function (method, args) { return new Promise(function (resolve, reject) {
    // query string
    var qs = null;
    // choose api based on method
    if (method === 'coord' && args.lat && args.lon)
        qs = document.baseURI + "api/weather?lat=" + args.lat + "&lon=" + args.lon;
    else if (method === 'zipcode' && args.zipcode)
        qs = document.baseURI + "api/weather?zip=" + args.zipcode;
    // set loading
    setLoading(true);
    if (qs)
        fetch(qs)
            // return api result parsed as json
            .then(function (result) {
            // parse JSON results
            result.text().then(function (text) { return resolve(JSON.parse(text)); });
            // set loading to false
            setLoading(false);
        })
            // reject api error
            .catch(function (err) { return reject(err); });
    else
        // reject if args not provided
        reject(new Error('"coord" requires both lat and lon arguments, "zipcode" requires zipcode argument.'));
}); };
////////////////
// Webpage UI //
////////////////
var handleZipcodeSearch = function () { return __awaiter(void 0, void 0, void 0, function () {
    var zipcode, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                zipcode = document.getElementById('zipcode-search').value;
                // dismiss location denied, if displayed
                document.getElementById('location-failed').style.setProperty('display', 'none');
                return [4 /*yield*/, fetchWeather('zipcode', { zipcode: zipcode })
                        // show user error on api failure
                        .catch(function (err) { return window.alert(err.message); })
                    // if data then update webpage
                ];
            case 1:
                result = _a.sent();
                // if data then update webpage
                if (result)
                    displayWeather(result);
                return [2 /*return*/];
        }
    });
}); };
var setLoading = function (state) {
    if (state) {
        LOADING = true;
        document.getElementById('loading').style.setProperty('display', 'inherit');
        document.getElementById('weather-wrapper').style.setProperty('display', 'none');
    }
    else {
        LOADING = false;
        document.getElementById('loading').style.setProperty('display', 'none');
        document.getElementById('weather-wrapper').style.setProperty('display', 'inherit');
    }
};
function displayWeather(data) {
    // get element by id or return temp element
    var el = function (id) {
        var el = document.getElementById(id);
        if (el)
            return el;
        else
            return document.getElementById('temp');
    };
    // convert kelvin to fahrenheit
    var convertTempToF = function (temp) { return Math.round(((temp - 273.15) * 9 / 5 + 32)) + " \u00B0F"; };
    // set html data
    el('city-name').innerText = data.name;
    // weather card
    el('current-temp').innerText = convertTempToF(data.main.temp);
    el('feels-temp').innerText = convertTempToF(data.main.feels_like);
    el('max-temp').innerText = convertTempToF(data.main.temp_max);
    el('min-temp').innerText = convertTempToF(data.main.temp_min);
    // wind and air card
    el('wind-speed').innerText = data.wind.speed + " mph";
    el('wind-deg').innerText = data.wind.deg + "\u00B0" + " of North";
    el('wind-gust').innerText = data.wind.gust ? data.wind.gust + "mph" : "na";
    el('humidity').innerText = data.main.humidity + " %";
    el('pressure').innerText = data.main.pressure + " hPa";
    // set weather icon
    el('weather-icon').setAttribute('src', "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
}
///////////////////
// Main Function //
///////////////////
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var location, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getLocation().catch(function (err) { return onLocationFailed(err); })
                // if user allows location
            ];
            case 1:
                location = _a.sent();
                if (!location) return [3 /*break*/, 3];
                return [4 /*yield*/, fetchWeather('coord', { lat: location.coords.latitude, lon: location.coords.longitude })
                        // show user error on api failure
                        .catch(function (err) { return window.alert(err.message); })
                    // if data then update webpage
                ];
            case 2:
                result = _a.sent();
                // if data then update webpage
                if (result)
                    displayWeather(result);
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
// exec main
main();
