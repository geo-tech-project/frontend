import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import geoblaze from 'geoblaze';
import { environment } from 'src/environments/environment';

import { MatSliderModule } from '@angular/material/slider';

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

  // URLs for all layers that have to be created
  predictionUrl = this.APIURL + '/predictionaoa/prediction.tif';
  aoaUrl = this.APIURL + '/predictionaoa/aoa.tif';
  aoiUrl = this.APIURL + '/processedsentinelimages/aoi.tif';
  furtherTrainAreasJSONUrl = this.APIURL + '/furthertrainareas/furtherTrainAreas.geojson';
  trainingDataPolygonsJSONUrl = this.APIURL + '/trainingdata/trainingsdaten_muenster_32632.gpkg';
  
  // Initially definining variables for layers
  predictionLayer = null;
  aoaLayer = null;
  aoiLayer = null;
  trainAreasLayer = null;

  // markerIcon = L.icon({
  //   iconUrl: this.APIURL + '/marker',
  // });

  // Set up map 
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
  }

  // Load the URLS and transform the tifs to GeoRaster objects with a nice visualization
  async createAllLayersFromTif() {
    // Fetch prediction url and create georaster object
    const responsePrediction = await fetch(this.predictionUrl);
    const arrayBufferPrediction = await responsePrediction.arrayBuffer();
    const georasterPrediction = await parseGeoRaster(arrayBufferPrediction);

    // Fetch aoa url and create georaster object
    const responseAOA = await fetch(this.aoaUrl);
    const arrayBufferAOA = await responseAOA.arrayBuffer();
    const georasterAOA = await parseGeoRaster(arrayBufferAOA);

    // Fetch aoi url and create georaster object
    // const responseAOI = await fetch(this.aoiUrl);
    // const arrayBufferAOI = await responseAOI.arrayBuffer();
    // const georasterAOI = await parseGeoRaster(arrayBufferAOI);

    // Fetch further train areas url and create geojson object
    const responseTrainAreas = await fetch(this.furtherTrainAreasJSONUrl);
    const furtherTrainAreasGeoJSON = await responseTrainAreas.json();
    this.trainAreasLayer = L.geoJSON(furtherTrainAreasGeoJSON.features);

    this.predictionLayer = new GeoRasterLayer({
      georaster: georasterPrediction,
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
    this.predictionLayer.addTo(this.map);

    this.aoaLayer = new GeoRasterLayer({
      georaster: georasterAOA,
      debugLevel: 1,
      opacity: 0.7,
      pixelValuesToColorFn: (values) =>
        values[1] === 0 ? '#000000 ' : values[1] === 1 ? '#FFFFFF ' : null,
      resolution: 64, // optional parameter for adjusting display resolution
    });
    // this.aoaLayer.addTo(this.map);

    // this.aoiLayer = new GeoRasterLayer({
    //   georaster: georasterAOI,
    //   debugLevel: 1,
    //   opacity: 0.7,
    //   resolution: 64, // optional parameter for adjusting display resolution
    // });
    // this.aoiLayer.addTo(this.map);
  }

  changeOpacity(event, name) {
    if (name == 'prediction') {
      this.predictionLayer.setOpacity(event.value);
    } else if (name == 'aoa') {
      this.aoaLayer.setOpacity(event.value);
    }
  }

  downloadData(name) {
    if (name == 'prediction') {
      window.open(this.APIURL + '/predictionaoa/prediction.tif', '_blank');
    } else if (name == 'aoa') {
      window.open(this.APIURL + '/predictionaoa/aoa.tif', '_blank');
    } else if (name == 'trainAreas') {
      window.open(this.APIURL + '/furthertrainareas/furtherTrainAreas.geojson', '_blank');
    } else if (name == 'aoi') {
      window.open(this.APIURL + '/processedsentinelimages/aoi.tif', '_blank');
    } else if (name == 'trainingData') {
      window.open(this.APIURL + '/processedsentinelimages/trainingData.tif', '_blank');
    }
  }

  checkboxClicked(name) {
    if (name == 'prediction') {
      if (
        (<HTMLInputElement>document.getElementById('predictionCheckbox'))
          .checked
      ) {
        this.predictionLayer.addTo(this.map);
        // this.map.fitBounds(this.predictionLayer)
        this.map.setView(this.predictionLayer.getBounds().getCenter());
      } else {
        this.map.removeLayer(this.predictionLayer);
      }
    } else if (name == 'aoa') {
      if ((<HTMLInputElement>document.getElementById('aoaCheckbox')).checked) {
        this.aoaLayer.addTo(this.map);
        this.map.setView(this.aoaLayer.getBounds().getCenter());
      } else {
        this.map.removeLayer(this.aoaLayer);
      }
    } else if (name == 'trainAreas') {
      if (
        (<HTMLInputElement>document.getElementById('trainAreasCheckbox'))
          .checked
      ) {
        this.trainAreasLayer.addTo(this.map);
      } else {
        this.map.removeLayer(this.trainAreasLayer);
      }
    }
  }

  private getJSON(): Observable<any> {
    return this.http.get(this.APIURL + '/json');
  }

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.createAllLayersFromTif();
  }
}
