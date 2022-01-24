"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.__esModule = true;
exports.MapComponent = void 0;
var core_1 = require("@angular/core");
var L = require("leaflet");
var forms_1 = require("@angular/forms");
var bulmaToast = require("bulma-toast");
var ng2_file_upload_1 = require("ng2-file-upload");
var environment_1 = require("src/environments/environment");
/**
 * @classdesc
 * This class is made to handle the map/input page of the application. It contains the map and the form with the input fields.
 * It also contains the uploader for the model/training data file. If the user submitted the form, the data is sent to the server.
 * Condional to the servers response, the class either redirect to the result page or displays an error message via bulma-toast.
 * @extends Component
 * @implements {AfterViewInit} @see AfterViewInit
 */
var MapComponent = /** @class */ (function () {
    function MapComponent(fb, http, router) {
        this.fb = fb;
        this.http = http;
        this.router = router;
        /**
         * @description
         * The filename which is shown to the user, after the user selected a file.
         * @type string
         */
        this.currentFileName = '';
        /**
         * @description
         * Is true if the user has submitted the form, is false if the user has not submitted the form.
         * @type boolean
         */
        this.formSubmitted = false;
        /**
         * @description
         * The url of the backend server. If the server is running in production mode the AWS server is used. If not localhost is used.
         * @type string
         */
        this.APIURL = environment_1.environment.api_url;
        /**
         * @description
         * The minimum Date the user can select in the datepicker. Set to 2016-01-01 as start Date of the Sentinel-2 mission.
         * @type Date
         */
        this.minDate = new Date(2016, 1, 1);
        /**
         * @description
         * The maximum Date the user can select in the datepicker. Set to today
         * @type Date
         */
        this.maxDate = new Date();
        // uploader for training data or trained model
        this.uploader = new ng2_file_upload_1.FileUploader({
            url: this.APIURL + '/upload',
            itemAlias: 'file'
        });
        this.trainingDataPolygonsJsonUrl = this.APIURL + '/trainingdata/';
        this.trainLayerGroup = null;
        this.trainAreasLayer = null;
    }
    /**
     * @function
     * @description
     * Get the index from the stepper
     * @param {MatStepper} stepper - The stepper from which the index is taken
     * @returns {number} - The index of the stepper
     */
    MapComponent.prototype.getStep = function (stepper) {
        return stepper.selectedIndex;
    };
    MapComponent.prototype.ngOnInit = function () {
        var _this = this;
        // initialize form group for validation and form stepper
        this.submitForm = this.fb.group({
            formArray: this.fb.array([
                // area of interest
                this.fb.group({
                    aoi: [null, forms_1.Validators.required],
                    selected: [null, forms_1.Validators.required]
                }),
                // trained model or training data
                this.fb.group({
                    option: [null, forms_1.Validators.required],
                    algorithm: ['rf', forms_1.Validators.required],
                    mtry: [2],
                    sigma: [null],
                    cost: [null]
                }),
                // file
                this.fb.group({
                    file: [null, forms_1.Validators.required]
                }),
                // timeframe for satellite images
                this.fb.group({
                    startDate: [null, forms_1.Validators.required],
                    endDate: [null, forms_1.Validators.required]
                }),
                // resolution
                this.fb.group({
                    resolution: [null, forms_1.Validators.required]
                }),
                // desired channels
                this.fb.group({
                    channels: [null, forms_1.Validators.required]
                }),
                // cloud coverage
                this.fb.group({
                    coverage: [null, forms_1.Validators.required]
                }),
            ])
        });
        //  what sould happen after a file was selected
        this.uploader.onAfterAddingFile = function (file) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(this.formArray);
                        return [4 /*yield*/, this.trainLayerGroup.clearLayers()];
                    case 1:
                        _a.sent();
                        file.withCredentials = false;
                        this.uploader.uploadAll();
                        return [2 /*return*/];
                }
            });
        }); };
        // what should happen after the file was succsessfully uploaded
        this.uploader.onCompleteItem = function (item, status) { return __awaiter(_this, void 0, void 0, function () {
            var trainDataURL, tmpURLgeojson, trainAreas, trainAreasGeoJson, filenameWithoutExtension_1, jsonData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // delete further uploaded files in uploads folder everytime a new file is selected
                        this.http.post(this.APIURL + '/deleteFiles', { file: this.currentFileName }).subscribe({
                            next: function (data) {
                                console.log(data);
                            },
                            error: function (error) {
                                console.log(error);
                            }
                        });
                        console.log('Uploaded File Details:', item);
                        trainDataURL = this.trainingDataPolygonsJsonUrl;
                        if (!(this.currentFileName.split('.').pop() == "geojson")) return [3 /*break*/, 5];
                        tmpURLgeojson = trainDataURL + this.currentFileName;
                        console.log(tmpURLgeojson);
                        return [4 /*yield*/, fetch(tmpURLgeojson)];
                    case 1:
                        trainAreas = _a.sent();
                        return [4 /*yield*/, trainAreas.json()];
                    case 2:
                        trainAreasGeoJson = _a.sent();
                        this.trainAreasLayer = L.geoJSON(trainAreasGeoJson.features);
                        return [4 /*yield*/, this.trainLayerGroup.addLayer(this.trainAreasLayer)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.map.fitBounds(this.trainAreasLayer.getBounds())];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (this.currentFileName.split('.').pop() == "gpkg") {
                            filenameWithoutExtension_1 = this.currentFileName.split('.')[0];
                            jsonData = { filename: filenameWithoutExtension_1 };
                            // send POST to start calculations
                            this.http.post(this.APIURL + '/getGeoJSON', jsonData).subscribe({
                                next: function (data) { return __awaiter(_this, void 0, void 0, function () {
                                    var tmpURLgpkg, trainAreasGPKGResponse, trainAreasGPKG;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                console.log(data);
                                                tmpURLgpkg = this.trainingDataPolygonsJsonUrl + filenameWithoutExtension_1 + ".geojson";
                                                console.log(tmpURLgpkg);
                                                return [4 /*yield*/, fetch(tmpURLgpkg)];
                                            case 1:
                                                trainAreasGPKGResponse = _a.sent();
                                                return [4 /*yield*/, trainAreasGPKGResponse.json()];
                                            case 2:
                                                trainAreasGPKG = _a.sent();
                                                this.trainAreasLayer = L.geoJSON(trainAreasGPKG.features);
                                                return [4 /*yield*/, this.trainLayerGroup.addLayer(this.trainAreasLayer)];
                                            case 3:
                                                _a.sent();
                                                return [4 /*yield*/, this.map.fitBounds(this.trainAreasLayer.getBounds())];
                                            case 4:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); },
                                error: function (error) {
                                    console.error('There was an error!', error);
                                }
                            });
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); };
    };
    MapComponent.prototype.initMap = function () {
        var _this = this;
        // set map options
        this.map = L.map('map', {
            center: [51.8906649, 7.6261347],
            zoom: 12,
            zoomControl: false
        });
        // position zoom controls bottom right
        new L.Control.Zoom({ position: 'topright' }).addTo(this.map);
        // set tiles and options
        var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 22,
            minZoom: 1,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        // add tiles to map
        tiles.addTo(this.map);
        // add layer group for trainareas to map
        this.trainLayerGroup = new L.LayerGroup();
        this.trainLayerGroup.addTo(this.map);
        // add draw options to map
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
        // control to draw a rectangle
        var drawControl = new L.Control.Draw({
            draw: {
                polygon: false,
                marker: false,
                polyline: false,
                circle: false,
                circlemarker: false
            }
        });
        this.map.addControl(drawControl);
        // control to delete drawn item
        var editControl = new L.Control.Draw({
            draw: {
                polygon: false,
                marker: false,
                polyline: false,
                circle: false,
                circlemarker: false,
                rectangle: false
            },
            edit: {
                featureGroup: this.drawnItems,
                edit: false
            }
        });
        // event when something is drawn on map
        this.map.on('draw:created', function (e) {
            var type = e.layerType, layer = e.layer;
            // disable option to draw another item
            _this.map.removeControl(drawControl);
            // add option to delete item
            _this.map.addControl(editControl);
            // rectagle drawn?
            if (type === 'rectangle') {
                //call function to set aoi
                _this.setAoi(layer.getLatLngs());
                // check checkbox
                document.getElementById('checkbox').click();
                // go to next step in stepper form when aoi was selected
                _this.stepperIndex = 1;
            }
            //add drawn layer to map
            _this.drawnItems.addLayer(layer);
        });
        // event when something was deleted from map
        this.map.on('draw:deleted', function (e) {
            _this.formArray.get([0]).patchValue({
                aoi: null
            });
            // jump back so the user has to select a aoi again
            _this.stepperIndex = 0;
            // add option to draw another item
            _this.map.addControl(drawControl);
            // disable option to delete item that cant be there
            _this.map.removeControl(editControl);
        });
    };
    Object.defineProperty(MapComponent.prototype, "formArray", {
        get: function () {
            return this.submitForm.get('formArray');
        },
        enumerable: false,
        configurable: true
    });
    //display name after file selected and pass to form
    MapComponent.prototype.fileSelected = function (event) {
        this.currentFileName = event.target.value.split('fakepath')[1].substring(1);
    };
    // function to set the area of interest in the formarray
    MapComponent.prototype.setAoi = function (coords) {
        this.formArray.get([0]).patchValue({
            aoi: coords
        });
    };
    MapComponent.prototype.getOptionValue = function () {
        var _a;
        return (_a = this.formArray) === null || _a === void 0 ? void 0 : _a.get([1]).value.option;
    };
    MapComponent.prototype.getAlgorithmValue = function () {
        var _a;
        return (_a = this.formArray) === null || _a === void 0 ? void 0 : _a.get([1]).value.algorithm;
    };
    MapComponent.prototype.getJSON = function (path) {
        return this.http.get(this.APIURL + '/file/' + path);
    };
    MapComponent.prototype.onSubmit = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        this.formSubmitted = true;
        if (this.submitForm.valid) {
            document.getElementById('progressModal').classList.add('is-active');
            //convert to json file
            var jsonData = {
                whereareyoufrom: 'map',
                topleftlat: (_a = this.formArray) === null || _a === void 0 ? void 0 : _a.get([0]).value.aoi[0][0].lat,
                topleftlng: (_b = this.formArray) === null || _b === void 0 ? void 0 : _b.get([0]).value.aoi[0][0].lng,
                bottomleftlat: (_c = this.formArray) === null || _c === void 0 ? void 0 : _c.get([0]).value.aoi[0][1].lat,
                bottomleftlng: (_d = this.formArray) === null || _d === void 0 ? void 0 : _d.get([0]).value.aoi[0][1].lng,
                bottomrightlat: (_e = this.formArray) === null || _e === void 0 ? void 0 : _e.get([0]).value.aoi[0][2].lat,
                bottomrightlng: (_f = this.formArray) === null || _f === void 0 ? void 0 : _f.get([0]).value.aoi[0][2].lng,
                toprightlat: (_g = this.formArray) === null || _g === void 0 ? void 0 : _g.get([0]).value.aoi[0][3].lat,
                toprightlng: (_h = this.formArray) === null || _h === void 0 ? void 0 : _h.get([0]).value.aoi[0][3].lng,
                option: (_j = this.formArray) === null || _j === void 0 ? void 0 : _j.get([1]).value.option,
                algorithm: (_k = this.formArray) === null || _k === void 0 ? void 0 : _k.get([1]).value.algorithm,
                startDate: (_l = this.formArray) === null || _l === void 0 ? void 0 : _l.get([3]).value.startDate,
                endDate: (_m = this.formArray) === null || _m === void 0 ? void 0 : _m.get([3]).value.endDate,
                filename: this.currentFileName,
                resolution: (_o = this.formArray) === null || _o === void 0 ? void 0 : _o.get([4]).value.resolution,
                channels: (_p = this.formArray) === null || _p === void 0 ? void 0 : _p.get([5]).value.channels,
                coverage: (_q = this.formArray) === null || _q === void 0 ? void 0 : _q.get([6]).value.coverage
            };
            if (jsonData.algorithm == 'rf') {
                jsonData['mtry'] = (_r = this.formArray) === null || _r === void 0 ? void 0 : _r.get([1]).value.mtry;
            }
            else if (jsonData.algorithm == 'svmRadial') {
                jsonData['sigma'] = (_s = this.formArray) === null || _s === void 0 ? void 0 : _s.get([1]).value.sigma;
                jsonData['cost'] = (_t = this.formArray) === null || _t === void 0 ? void 0 : _t.get([1]).value.cost;
            }
            // send POST to start calculations
            this.http.post(this.APIURL + '/start', jsonData).subscribe({
                next: function (data) {
                    console.log('Data', data);
                    _this.map.removeLayer(_this.drawnItems);
                    //console.log(data);
                    document
                        .getElementById('progressModal')
                        .classList.remove('is-active');
                    _this.router.navigate(['result']);
                },
                error: function (error) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
                    console.error('There was an error!', error);
                    if (error.status === 402) {
                        //Fire an alert with the error message
                        var hasAoiError = ((_c = (_b = (_a = error.error) === null || _a === void 0 ? void 0 : _a.stac) === null || _b === void 0 ? void 0 : _b.aoi) === null || _c === void 0 ? void 0 : _c.status) === 'error';
                        var hasTrainingDataError = ((_f = (_e = (_d = error.error) === null || _d === void 0 ? void 0 : _d.stac) === null || _e === void 0 ? void 0 : _e.trainingData) === null || _f === void 0 ? void 0 : _f.status) === 'error';
                        var errorText = '';
                        if (hasAoiError && hasTrainingDataError) {
                            errorText = ((_j = (_h = (_g = error.error) === null || _g === void 0 ? void 0 : _g.stac) === null || _h === void 0 ? void 0 : _h.aoi) === null || _j === void 0 ? void 0 : _j.error) + "\n" + ((_m = (_l = (_k = error.error) === null || _k === void 0 ? void 0 : _k.stac) === null || _l === void 0 ? void 0 : _l.trainingData) === null || _m === void 0 ? void 0 : _m.error);
                        }
                        else if (hasAoiError) {
                            errorText = (_q = (_p = (_o = error.error) === null || _o === void 0 ? void 0 : _o.stac) === null || _p === void 0 ? void 0 : _p.aoi) === null || _q === void 0 ? void 0 : _q.error;
                        }
                        else if (hasTrainingDataError) {
                            errorText = (_t = (_s = (_r = error.error) === null || _r === void 0 ? void 0 : _r.stac) === null || _s === void 0 ? void 0 : _s.trainingData) === null || _t === void 0 ? void 0 : _t.error;
                        }
                        else {
                            errorText = 'There was an error!';
                        }
                        errorText += '\nPlease update your input (date period and/or cloud coverage) and try again.';
                        //alert(errorText);
                        document
                            .getElementById('progressModal')
                            .classList.remove('is-active');
                        bulmaToast.toast({
                            message: errorText,
                            type: 'is-danger',
                            position: 'top-right',
                            duration: 1000 * 3600,
                            dismissible: true
                        });
                    }
                    else if (error.status === 401) {
                        console.error("There was an error with status code " + error.status + "!", error);
                        var errorText = ((_v = (_u = error === null || error === void 0 ? void 0 : error.error) === null || _u === void 0 ? void 0 : _u.error) === null || _v === void 0 ? void 0 : _v.error) + '\nPlease check your input and try again.';
                        document
                            .getElementById('progressModal')
                            .classList.remove('is-active');
                        bulmaToast.toast({
                            message: errorText,
                            type: 'is-danger',
                            position: 'top-right',
                            duration: 1000 * 3600,
                            dismissible: true
                        });
                    }
                    else {
                        document
                            .getElementById('progressModal')
                            .classList.remove('is-active');
                        bulmaToast.toast({
                            message: 'There was an unexpected error! Please try again.',
                            type: 'is-danger',
                            position: 'top-right',
                            duration: 1000 * 3600,
                            dismissible: true
                        });
                    }
                }
            });
        }
        else {
            console.log(this.submitForm);
            console.log('invalid');
        }
    };
    MapComponent.prototype.ngAfterViewInit = function () {
        this.initMap();
    };
    MapComponent = __decorate([
        core_1.Component({
            selector: 'app-map',
            templateUrl: './map.component.html',
            styleUrls: ['./map.component.scss']
        })
    ], MapComponent);
    return MapComponent;
}());
exports.MapComponent = MapComponent;
