import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { NgModule } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  currentFileName = '';

  constructor() {}

  userForm = new FormGroup({
    name: new FormControl(),
    age: new FormControl('20'),
  });

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
    var drawControl = new L.Control.Draw({
      draw: {
        polygon: false,
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        //edit: false
      },
    });
    this.map.addControl(drawControl);

    drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    this.map.on('draw:created', function (e) {
      var type = e.layerType,
        layer = e.layer;

      if (type === 'rectangle') {
        layer.on('mouseover', function () {
          alert(layer.getLatLngs());
        });
      }
      drawnItems.addLayer(layer);
    });

  }

  fileSelected(event) {
    this.currentFileName = event.target.value.split('fakepath')[1].substring(1);
  }

  onSubmit() {
    alert('submit button clicked');
  }

  onDemoButton() {
    alert('Demo button clicked');
  }

  startDate(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log(type);
    console.log(event);
  }

  endDate(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log(type);
    console.log(event);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
