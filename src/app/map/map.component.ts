import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { NgModule } from '@angular/core';
import {
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
  submitForm: FormGroup;
  currentFileName = '';
  formSubmitted = false;
  APIURL = environment.api_url;
  data;

  public uploader: FileUploader = new FileUploader({
    url: this.APIURL + '/upload',
    itemAlias: 'file',
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.submitForm = new FormGroup({
      aoi: new FormControl(null, [Validators.required]),
      option: new FormControl(null, [Validators.required]),
      file: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
    });

    this.uploader.onAfterAddingFile = (file) => {
      console.log(file);
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, status: any) => {
      //generate json
      var jsonData = {
        topleftlat: this.submitForm.value.aoi[0][0].lat,
        topleftlng: this.submitForm.value.aoi[0][0].lng,
        bottomleftlat: this.submitForm.value.aoi[0][1].lat,
        bottomleftlng: this.submitForm.value.aoi[0][1].lng,
        bottomrightlat: this.submitForm.value.aoi[0][2].lat,
        bottomrightlng: this.submitForm.value.aoi[0][2].lng,
        toprightlat: this.submitForm.value.aoi[0][3].lat,
        toprightlng: this.submitForm.value.aoi[0][3].lng,
        option: this.submitForm.value.option,
        startDate: this.submitForm.value.startDate,
        endDate: this.submitForm.value.endDate,
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
      zoomControl: false
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
        edit: false
      },
    });
    this.map.addControl(editControl);

    drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    // event when something is drawn on map
    this.map.on('draw:created', (e) => {
      var type = e.layerType,
        layer = e.layer;
      this.map.removeControl(drawControl);
      // rectagle drawn?
      if (type === 'rectangle') {
        //call function to set aoi
        this.setAoi(layer.getLatLngs());
      }
      //add drawn layer to map
      drawnItems.addLayer(layer);
    });
  }

  //display name after file selected and pass to form
  fileSelected(event) {
    this.submitForm.patchValue({
      file: event.target.files[0],
    });
    this.currentFileName = event.target.value.split('fakepath')[1].substring(1);
  }

  // function to set the area of interest
  setAoi(coords) {
    this.submitForm.patchValue({
      aoi: coords,
    });
  }

  closeModal() {
    document.getElementsByClassName('modal')[0].classList.remove('is-active');
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.submitForm.valid) {
      this.uploader.uploadAll();
    } else {
      console.log('invalid');
    }
  }

  onDemoButton() {
    alert('Demo button clicked')
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
