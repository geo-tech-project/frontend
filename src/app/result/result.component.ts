import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import geoblaze from 'geoblaze';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements AfterViewInit {
  private map;
  private layerGroup;
  private layerControl;
  private classes = [];

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
    this.getJSON().subscribe((data) => {
      this.classes = data;
    });
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
                ? this.getHexColor(this.classes[0])
                : values[0] === 2
                ? this.getHexColor(this.classes[1])
                : values[0] === 3
                ? this.getHexColor(this.classes[2])
                : values[0] === 4
                ? this.getHexColor(this.classes[3])
                : values[0] === 5
                ? this.getHexColor(this.classes[4])
                : values[0] === 6
                ? this.getHexColor(this.classes[5])
                : values[0] === 7
                ? '#656661'
                : null,
            resolution: 64, // optional parameter for adjusting display resolution
          });
          layer.addTo(this.map);
          this.layerGroup = L.layerGroup().addLayer(layer);
          this.layerControl.addOverlay(this.layerGroup, name);
          // get class number
          this.map.on('click', function (evt) {
            console.log(evt);
            alert(
              geoblaze.identify(georaster, [evt.latlng.lng, evt.latlng.lat])
            );
          });
        });
      });
  }

  private getJSON(): Observable<any> {
    return this.http.get('http://localhost:8781/json');
  }

  private getHexColor(cl) {
    switch (cl) {
      case 'Fallow field':
        return '#eab676';
      case 'Grassland':
        return '#76b364';
      case 'Industrial':
        return '#000000';
      case 'Inland water':
        return '#6372d4';
      case 'Mixed forest':
        return '#1f4f11';
      case 'Planted field':
        return '#8d9931';
      case 'Urban':
        return '#656661';
      default:
        return null;
    }
  }

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.initMap();
    //this.addRaster('http://localhost:8781/stack/aoa.tif', 'AOA');
    this.addRaster(
      'http://localhost:8781/stack/prediction.tif',
      'Classification'
    );
    this.getQueryParams();
  }
}
