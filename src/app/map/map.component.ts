import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  // form for all inputs
  submitForm: FormGroup;
  // filename to display after choosing a file
  currentFileName = '';
  // to check if file was submitted before
  formSubmitted = false;
  // url to run on -> localhost or ip
  APIURL = environment.api_url;
  // dont know
  data;

  // uploader for training data or trained model
  public uploader: FileUploader = new FileUploader({
    url: this.APIURL + '/upload',
    itemAlias: 'file',
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    // initialize form group for validation and form stepper
    this.submitForm = this.fb.group({
      formArray: this.fb.array([
        // area of interest
        this.fb.group({
          aoi: [null, Validators.required],
        }),
        // trained model or training data
        this.fb.group({
          option: [null, Validators.required],
        }),
        // file
        this.fb.group({
          file: [null, Validators.required],
        }),
        // timeframe for satelite images
        this.fb.group({
          startDate: [null, Validators.required],
          endDate: [null, Validators.required],
        }),
      ]),
    });

    //  what sould happen after a file was selected
    this.uploader.onAfterAddingFile = (file) => {
      console.log(file);
      file.withCredentials = false;
    };

    // what should happen after the file was succsessfully uploaded
    this.uploader.onCompleteItem = (item: any, status: any) => {
      //convert to json file
      var jsonData = {
        topleftlat: this.formArray?.get([0]).value.aoi[0][0].lat,
        topleftlng: this.formArray?.get([0]).value.aoi[0][0].lng,
        bottomleftlat: this.formArray?.get([0]).value.aoi[0][1].lat,
        bottomleftlng: this.formArray?.get([0]).value.aoi[0][1].lng,
        bottomrightlat: this.formArray?.get([0]).value.aoi[0][2].lat,
        bottomrightlng: this.formArray?.get([0]).value.aoi[0][2].lng,
        toprightlat: this.formArray?.get([0]).value.aoi[0][3].lat,
        toprightlng: this.formArray?.get([0]).value.aoi[0][3].lng,
        option: this.formArray?.get([1]).value.option,
        startDate: this.formArray?.get([3]).value.startDate,
        endDate: this.formArray?.get([3]).value.endDate,
        filename: item._file.name,
      };
      // send POST to start calculations
      this.http.post(this.APIURL + '/start', jsonData).subscribe({
        next: (data) => {
          console.log(data);
          this.data = data;
        },
        error: (error) => {
          console.error('There was an error!', error);
        },
      });
    };
  }

  // init map
  private map: any;
  private initMap(): void {
    // set map options
    this.map = L.map('map', {
      center: [51.9606649, 7.6261347],
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

    // add draw options to map
    var drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
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
        featureGroup: drawnItems,
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
      }
      //add drawn layer to map
      drawnItems.addLayer(layer);
    });

    // event when something was deleted from map
    this.map.on('draw:deleted', (e) => {
      this.formArray.get([0]).patchValue({
        aoi: null,
      });
      // add option to draw another item
      this.map.addControl(drawControl);
      // disable option to delete item that cant be there
      this.map.removeControl(editControl);
    });
  }

  get formArray(): AbstractControl | null {
    return this.submitForm.get('formArray');
  }

  //display name after file selected and pass to form
  fileSelected(event) {
    this.currentFileName = event.target.value.split('fakepath')[1].substring(1);
    console.log(this.submitForm);
  }

  // function to set the area of interest in the formarray
  setAoi(coords) {
    this.formArray.get([0]).patchValue({
      aoi: coords,
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.submitForm.valid) {
      this.uploader.uploadAll();
    } else {
      console.log(this.submitForm);
      console.log('invalid');
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
