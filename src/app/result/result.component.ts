import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements AfterViewInit {
  private map;
  private layerGroup;
  private layerControl;

  private initMap(): void {
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

    this.layerControl = L.control.layers().addTo(this.map);
  }

  private getQueryParams() {
    console.log(this.route.queryParams);
    return this.route.queryParams;
  }

  private addRaster(tiffUrl, name): void {
    var url_to_geotiff_file = tiffUrl;

    fetch(url_to_geotiff_file)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        parseGeoRaster(arrayBuffer).then((georaster) => {
          console.log('georaster:', georaster);
          var layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7,
            resolution: 64, // optional parameter for adjusting display resolution
          });
          layer.addTo(this.map);
          this.layerGroup = L.layerGroup().addLayer(layer);
          this.layerControl.addOverlay(this.layerGroup, name);
        });
      });
  }

  constructor(private route: ActivatedRoute) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.addRaster('http://localhost:8781/stack/aoa.tif', 'AOA');
    this.addRaster('http://localhost:8781/stack/prediction.tif', 'Classification');
    this.getQueryParams();
  }
}
