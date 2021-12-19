import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import geoblaze from 'geoblaze';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements AfterViewInit {
  private map;
  private layerGroup;
  private layerControl;
  // url to run on -> localhost or ip
  APIURL = environment.api_url;

  private initMap(): void {
    this.map = L.map('resultmap', {
      center: [51.9606649, 7.6261347],
      zoom: 12,
      zoomControl: false,
    });

    //position zoom controls bottom right
    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    //set tiles and options
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 22,
        minZoom: 1,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    //add tiles to map
    tiles.addTo(this.map);

    this.layerControl = L.control.layers().addTo(this.map);
  }

  private getQueryParams() {
    return this.route.queryParams;
  }

  private addRaster(tiffUrl, name): void {
    fetch(tiffUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        parseGeoRaster(arrayBuffer).then((georaster) => {
          console.log('georaster:', georaster);

          var layer = new GeoRasterLayer({
            georaster: georaster,
            debugLevel: 1,
            opacity: 0.7,
            pixelValuesToColorFn: (values) =>
                  values[0] === 1
                ? '#0EB700 '
                : values[0] === 2
                ? '#C1BE00 '
                : values[0] === 3
                ? '#CBCBCB'
                : values[0] === 4
                ? '#002372'
                : values[0] === 5
                ? '#6b6f3a'
                : values[0] === 6
                ? '#296400'
                : values[0] === 7
                ? '#FF3737'
                : null,
            resolution: 64, // optional parameter for adjusting display resolution
          });
          layer.addTo(this.map);
          this.layerGroup = L.layerGroup().addLayer(layer);
          this.layerControl.addOverlay(this.layerGroup, name);
          // get class number
          this.map.on('click',async function (evt) {
            console.log(evt);
            var className = await geoblaze.identify(georaster, [0, 0]);
            alert(className);
          });
        });
      });
  }

  private getJSON(): Observable<any> {
    return this.http.get(this.APIURL + '/json');
  }

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.initMap();
    //this.addRaster('http://localhost:8781/stack/aoa.tif', 'AOA');
    this.addRaster(
      this.APIURL +'/predictionaoa/prediction.tif',
      'Classification'
    );
    this.getQueryParams();
  }
}
