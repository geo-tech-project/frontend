import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import * as bulmaToast from 'bulma-toast';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent implements AfterViewInit {
  // filename to display after choosing a file
  currentFileName = 'demoModel.RDS';
  // url to run on -> localhost or ip
  APIURL = environment.api_url;

  algorithm = 'rf';

  dates: FormGroup;

  selectedChannels = ['B02', 'B03', 'B04'];

  resolution = '10';

  json = {
    whereareyoufrom: 'demo',
    topleftlat: 51.946286720328104,
    topleftlng: 7.5971644627228905,
    bottomleftlat: 51.975309509611826,
    bottomleftlng: 7.5971644627228905,
    bottomrightlat: 51.975309509611826,
    bottomrightlng: 7.652018947455736,
    toprightlat: 51.946286720328104,
    toprightlng: 7.652018947455736,
    option: 'model',
    algorithm: 'rf',
    startDate: '2021-05-31T22:00:00.000Z',
    endDate: '2021-08-30T22:00:00.000Z',
    filename: 'model.RDS',
    resolution: '10',
    channels: ['B02', 'B03', 'B04', 'SCL'],
    coverage: 20,
    mtry: 2,
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.dates = new FormGroup({
      start: new FormControl(new Date(2021, 4, 31)),
      end: new FormControl(new Date(2021, 7, 30)),
    });
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

    L.rectangle([
      [51.946286720328104, 7.5971644627228905],
      [51.975309509611826, 7.652018947455736],
    ]).addTo(this.map);
  }

  onSubmit() {
    document.getElementById('progressModal').classList.add('is-active');
    this.http.post(this.APIURL + '/start', this.json).subscribe({
      next: (data) => {
        console.log('Data', data);
        document.getElementById('progressModal').classList.remove('is-active');
        this.router.navigate(['result']);
      },
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
