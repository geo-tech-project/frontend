import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as bulmaToast from 'bulma-toast';

import { HttpClient } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';

/**
 * @classdesc
 * This class is made to handle the map/input page of the application. It contains the map and the form with the input fields.
 * It also contains the uploader for the model/training data file. If the user submitted the form, the data is sent to the server.
 * Condional to the servers response, the class either redirect to the result page or displays an error message via bulma-toast.
 * @extends Component
 * @implements {AfterViewInit} @see AfterViewInit
 */
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  /**
   * @description
   * This form stores all the user inputs. It is used to send the data to the server.
   * @type FormGroup
   */
  submitForm: FormGroup;

  /**
   * @description
   * The filename which is shown to the user, after the user selected a file.
   * @type string
   */
  currentFileName = '';

  /**
   * @description
   * Is true if the user has submitted the form, is false if the user has not submitted the form.
   * @type boolean
   */
  formSubmitted = false;

  /**
   * @description
   * The url of the backend server. If the server is running in production mode the AWS server is used. If not localhost is used.
   * @type string
   */
  APIURL = environment.api_url;

  // TODO: Brauchen wir das überhaupt?
  data;

  /**
   * @description
   * The retangle drawn by the user on the Leaflet map.
   *
   */
  drawnItems;

  /**
   * @description
   * The index of the step in the form the user is in. This is used to control which step iss shown to the user. It also makes sure, that user can not
   * skip a part of the form.
   * @type number
   */
  stepperIndex;

  /**
   * @function
   * @description
   * Get the index from the stepper
   * @param {MatStepper} stepper - The stepper from which the index is taken
   * @returns {number} - The index of the stepper
   */
  getStep(stepper: MatStepper) {
    return stepper.selectedIndex;
  }

  /**
   * @description
   * The minimum Date the user can select in the datepicker. Set to 2016-01-01 as start Date of the Sentinel-2 mission.
   * @type Date
   */
  minDate = new Date(2016, 1, 1);

  /**
   * @description
   * The maximum Date the user can select in the datepicker. Set to today
   * @type Date
   */
  maxDate = new Date();

  /**
   * @description
   * A FileUploader is used to upload the model/training data file. Stores the route where the file is uploaded to.
   * And an itemAlias is used to store the filename.
   * @type FileUploader
   */
  public uploader: FileUploader = new FileUploader({
    url: this.APIURL + '/upload',
    itemAlias: 'file',
  });

  /**
   * @constructor
   * @description
   * The constructor of the class. It initializes the form, http client and router.
   * @param {FormBuilder} fb - The form builder used to create the form.
   * @param {HttpClient} http - The http client used to send the data to the server.
   * @param {Router} router - The router used to navigate to the result page.
   */
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * @description
   * The URL where the training data file can be found.
   * @type string
   */
  trainingDataPolygonsJsonUrl = this.APIURL + '/trainingdata/';

  /**
   * @description
   * A Leaflet group of the training data polygons.
   * @type L.FeatureGroup
   */
  trainLayerGroup = null;

  /**
   * @description
   * A Leaflet Layer of the training data polygons.
   * @type L.GeoJSON
   */
  trainAreasLayer = null;

  /**
   * @function
   * @description
   * After the page is loaded, this function is called. It initializes the map and the form. It is setting the validators for the form. And adding event
   * listeners for certain events like the uploading of the model/training data file. Also handling the functionality, that if training data are uploaded,
   * the polygons are displayed on the map.
   * @returns {void}
   */
  ngOnInit() {
    // initialize form group for validation and form stepper
    this.submitForm = this.fb.group({
      formArray: this.fb.array([
        // area of interest
        this.fb.group({
          aoi: [null, Validators.required],
          selected: [null, Validators.required],
        }),
        // trained model or training data
        this.fb.group({
          option: [null, Validators.required],
          algorithm: ['rf', Validators.required],
          mtry: [2],
          sigma: [0.5],
          cost: [1],
        }),
        // file
        this.fb.group({
          file: [null, Validators.required],
        }),
        // timeframe for satellite images
        this.fb.group({
          startDate: [null, Validators.required],
          endDate: [null, Validators.required],
        }),
        // resolution
        this.fb.group({
          resolution: [null, Validators.required],
        }),
        // desired channels
        this.fb.group({
          channels: [null, Validators.required],
        }),
        // cloud coverage
        this.fb.group({
          coverage: [null, Validators.required],
        }),
      ]),
    });

    //  what sould happen after a file was selected
    this.uploader.onAfterAddingFile = async (file) => {
      console.log(this.formArray);

      await this.trainLayerGroup.clearLayers();

      file.withCredentials = false;
      this.uploader.uploadAll();
    };

    // what should happen after the file was succsessfully uploaded
    this.uploader.onCompleteItem = async (item: any, response: any, status: number) => {
      console.log(status)
      if (status === 401) {
        response = JSON.parse(response)
        console.error(
          `There was an error with status code ${status}!`);
        let errorText = response?.error?.error + '\nPlease check your input and try again.';
        console.log(errorText)
        this.formArray.get([2]).patchValue({
          file: null
        });
        console.log(this.submitForm)
        console.log(this.formArray)
        bulmaToast.toast({
          message: errorText,
          type: 'is-danger',
          position: 'top-right',
          duration: 1000 * 3600,
          dismissible: true,
        });
      } else if (status === 200) {
        // delete further uploaded files in uploads folder everytime a new file is selected
        this.http
        .post(this.APIURL + '/deleteFiles', { file: this.currentFileName })
        .subscribe({
          next: (data) => {
            console.log(data);
          },
          error: (error) => {
            console.log(error);
          },
        });

        console.log('Uploaded File Details:', item);

        let trainDataURL = this.trainingDataPolygonsJsonUrl;

        if (this.currentFileName.split('.').pop() == 'geojson') {
          let tmpURLgeojson = trainDataURL + this.currentFileName;
          console.log(tmpURLgeojson);

          let trainAreas = await fetch(tmpURLgeojson);
          let trainAreasGeoJson = await trainAreas.json();
          console.log(trainAreasGeoJson)

          this.trainAreasLayer = L.geoJSON( trainAreasGeoJson,
                                            {onEachFeature: function(feature, layer) {
                                                              layer.bindPopup('<p>'+feature.properties.Label+'</p>');
                                                            }
                                            }
          );
          await this.trainLayerGroup.addLayer(this.trainAreasLayer);
          var bounds = this.trainAreasLayer.getBounds();
          var center = bounds.getCenter();
          this.map.flyToBounds(bounds);
          this.map.invalidateSize();
          //this.map.setView([center.lat, center.lng]);
        }
        // if the uploaded training Data is ".gpkg"
        else if (this.currentFileName.split('.').pop() == 'gpkg') {
          let filenameWithoutExtension = this.currentFileName.split('.')[0];
          let jsonData = { filename: filenameWithoutExtension };

          // send POST to start calculations
          this.http.post(this.APIURL + '/getGeoJSON', jsonData).subscribe({
            next: async (data) => {
              console.log(data);

              let tmpURLgpkg = this.trainingDataPolygonsJsonUrl + filenameWithoutExtension + '.geojson';
              console.log(tmpURLgpkg);

              let trainAreasGPKGResponse = await fetch(tmpURLgpkg);
              let trainAreasGPKG = await trainAreasGPKGResponse.json();

              this.trainAreasLayer = L.geoJSON( trainAreasGPKG,
                                                {onEachFeature: function(feature, layer) {
                                                                  layer.bindPopup('<p>'+feature.properties.Label+'</p>');
                                                                }
                                                }
              );
              await this.trainLayerGroup.addLayer(this.trainAreasLayer);
              var bounds = this.trainAreasLayer.getBounds();
              var center = bounds.getCenter();
              this.map.flyToBounds(bounds);
              this.map.invalidateSize();
            },
            error: (error) => {
              console.error('There was an error!', error);
            },
          });
        }
      }
      
    };
  }

  /**
   * @description
   * Initializes the map field.
   * @type {any}
   */
  private map: any;

  /**
   * @function
   * @description
   * Initializes the map. Set the center of the map to the center of Münster. Set the zoom level to 12.
   * Setting the zoom control to the top right corner. Also adding the tile Layer from the OpenStreetMap. Adding the FeatureGroup for displaying the
   * training data polygons. Also adding the Draw control to the map, which is used for drawing the AOI. Controlling the storing of the drawn data,
   * so that the user can only draw one rectangle.
   * @returns {void}
   */
  private initMap(): void {
    // set map options
    this.map = L.map('map', {
      center: [51.8906649, 7.6261347],
      zoom: 12,
      zoomControl: false,
    });

    // position zoom controls bottom right
    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    // set tiles and options
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 22,
        minZoom: 1,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
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
        circlemarker: false,
      },
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
        rectangle: false,
      },
      edit: {
        featureGroup: this.drawnItems,
        edit: false,
      },
    });
    // event when something is drawn on map
    this.map.on('draw:created', (e) => {
      var type = e.layerType,
        layer = e.layer;
      // disable option to draw another item
      this.map.removeControl(drawControl);
      // add option to delete item
      this.map.addControl(editControl);
      // rectagle drawn?
      if (type === 'rectangle') {
        //call function to set aoi
        this.setAoi(layer.getLatLngs());
        // check checkbox
        document.getElementById('checkbox').click();
        // go to next step in stepper form when aoi was selected
        this.stepperIndex = 1;
      }
      //add drawn layer to map
      this.drawnItems.addLayer(layer);
    });

    // event when something was deleted from map
    this.map.on('draw:deleted', (e) => {
      this.formArray.get([0]).patchValue({
        aoi: null,
      });
      // jump back so the user has to select a aoi again
      this.stepperIndex = 0;
      // add option to draw another item
      this.map.addControl(drawControl);
      // disable option to delete item that cant be there
      this.map.removeControl(editControl);
    });
  }

  /**
   * @function
   * @description
   * get the form array from the form group
   * @returns {AbstractControl | null} the form array
   */
  get formArray(): AbstractControl | null {
    return this.submitForm.get('formArray');
  }

  /**
   * @function
   * @description
   * Display the name of the file, which was selected by the user.
   * @param {Event} event the event of the file input
   * @returns {void}
   */
  fileSelected(event) {
    this.currentFileName = event.target.value.split('fakepath')[1].substring(1);
  }

  /**
   * @function
   * @description
   * Set the AOI to the form group.
   * @param {any} aoi the aoi as a bbox
   * @returns {void}
   */
  setAoi(coords) {
    this.formArray.get([0]).patchValue({
      aoi: coords,
    });
  }

  /**
   * @function
   * @description
   * Return the option value from the formArray.
   * @returns {string} the option value
   */
  getOptionValue() {
    return this.formArray?.get([1]).value.option;
  }

  /**
   * @function
   * @description
   * get the value of the Algorithm, which was selected by the user.
   * @returns {string} the selected algorithm name
   */
  getAlgorithmValue() {
    return this.formArray?.get([1]).value.algorithm;
  }

  /**
   * @function
   * @description
   * get the JSON at the seleced file.
   * @param {String} path - path to the file
   * @returns {Observable<any>} the JSON
   */
  getJSON(path): Observable<any> {
    return this.http.get(this.APIURL + '/file/' + path);
  }

  /**
   * @function
   * @description
   * This function gets fired when the user hit the submit button. It will get the data from the form group and send it to the server at the /start route.
   * After the server response the function will either redirect to the result page or display an error message.
   * @returns {void}
   */
  onSubmit() {
    this.formSubmitted = true;
    if (this.submitForm.valid) {
      document.getElementById('progressModal').classList.add('is-active');

      //convert to json file
      var jsonData = {
        whereareyoufrom: 'map',
        topleftlat: this.formArray?.get([0]).value.aoi[0][0].lat,
        topleftlng: this.formArray?.get([0]).value.aoi[0][0].lng,
        bottomleftlat: this.formArray?.get([0]).value.aoi[0][1].lat,
        bottomleftlng: this.formArray?.get([0]).value.aoi[0][1].lng,
        bottomrightlat: this.formArray?.get([0]).value.aoi[0][2].lat,
        bottomrightlng: this.formArray?.get([0]).value.aoi[0][2].lng,
        toprightlat: this.formArray?.get([0]).value.aoi[0][3].lat,
        toprightlng: this.formArray?.get([0]).value.aoi[0][3].lng,
        option: this.formArray?.get([1]).value.option,
        algorithm: this.formArray?.get([1]).value.algorithm,
        startDate: this.formArray?.get([3]).value.startDate,
        endDate: this.formArray?.get([3]).value.endDate,
        filename: this.currentFileName,
        resolution: this.formArray?.get([4]).value.resolution,
        channels: this.formArray?.get([5]).value.channels,
        coverage: this.formArray?.get([6]).value.coverage,
      };

      if (jsonData.algorithm == 'rf') {
        jsonData['mtry'] = this.formArray?.get([1]).value.mtry;
      } else if (jsonData.algorithm == 'svmRadial') {
        jsonData['sigma'] = this.formArray?.get([1]).value.sigma;
        jsonData['cost'] = this.formArray?.get([1]).value.cost;
      }

      // send POST to start calculations
      this.http.post(this.APIURL + '/start', jsonData).subscribe({
        next: (data) => {
          console.log('Data', data);
          this.map.removeLayer(this.drawnItems);
          //console.log(data);
          document
            .getElementById('progressModal')
            .classList.remove('is-active');
          this.router.navigate(['result']);
        },
        error: (error) => {
          console.error('There was an error!', error);
          if (error.status === 402) {
            //Fire an alert with the error message
            let hasAoiError = error.error?.stac?.aoi?.status === 'error';
            let hasTrainingDataError =
              error.error?.stac?.trainingData?.status === 'error';
            let errorText = '';

            if (hasAoiError && hasTrainingDataError) {
              errorText =
                error.error?.stac?.aoi?.error +
                '\n' +
                error.error?.stac?.trainingData?.error;
            } else if (hasAoiError) {
              errorText = error.error?.stac?.aoi?.error;
            } else if (hasTrainingDataError) {
              errorText = error.error?.stac?.trainingData?.error;
            } else {
              errorText = 'There was an error!';
            }
            errorText +=
              '\nPlease update your input (date period and/or cloud coverage) and try again.';

            //alert(errorText);
            document
              .getElementById('progressModal')
              .classList.remove('is-active');

            bulmaToast.toast({
              message: errorText,
              type: 'is-danger',
              position: 'top-right',
              duration: 1000 * 3600,
              dismissible: true,
            });
          } else if ((error.status = 403)) {
            let errorText;
            if (
              error.error?.aoa?.training?.error === undefined &&
              error.error?.aoa?.classifyAndAOA?.error === undefined
            ) {
              errorText = 'The server environment was exited';

              //alert(errorText);
              document
                .getElementById('progressModal')
                .classList.remove('is-active');

              bulmaToast.toast({
                message: errorText,
                type: 'is-danger',
                position: 'top-right',
                duration: 1000 * 3600,
                dismissible: true,
              });
            } else {
              //Fire an alert with the error message
              if (error.error?.aoa?.training?.error === undefined) {
                errorText =
                  error.error?.aoa?.training?.data +
                  '\n' +
                  error.error?.aoa?.classifyAndAOA?.error +
                  '\nPlease update your input data (model / training data) and try again.';
              } else {
                errorText =
                  error.error?.aoa?.training?.error +
                  '\n' +
                  error.error?.aoa?.classifyAndAOA?.error +
                  '\nPlease update your input data (model / training data) and try again.';
              }

              //alert(errorText);
              document
                .getElementById('progressModal')
                .classList.remove('is-active');

              bulmaToast.toast({
                message: errorText,
                type: 'is-danger',
                position: 'top-right',
                duration: 1000 * 3600,
                dismissible: true,
              });
            }
          } else {
            document
              .getElementById('progressModal')
              .classList.remove('is-active');
            bulmaToast.toast({
              message: 'There was an unexpected error! Please try again.',
              type: 'is-danger',
              position: 'top-right',
              duration: 1000 * 3600,
              dismissible: true,
            });
          }
        },
      });
    } else {
      console.log(this.submitForm);
      console.log('invalid');
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
