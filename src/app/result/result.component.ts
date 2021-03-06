import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import chroma from 'chroma-js';

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
  // url to run on -> localhost or ip
  APIURL = environment.api_url;

  // URLs for all layers that have to be created
  predictionUrl = this.APIURL + '/predictionaoa/prediction.tif';
  aoaUrl = this.APIURL + '/predictionaoa/aoa.tif';
  classesUrl = this.APIURL + '/predictionaoa/classes.json';
  furtherTrainAreasJSONUrl = this.APIURL + '/furthertrainareas/furtherTrainAreas.geojson';
  aoiUrl = this.APIURL + '/processedsentinelimages/aoi.tif';
  trainingDataTifUrl = this.APIURL + '/processedsentinelimages/trainingData.tif';
  modelUrl = this.APIURL + '/model/model.RDS';

  // Initially definining variables for layers
  predictionLayer = null;
  aoaLayer = null;
  aoiLayer = null;
  trainAreasLayer = null;

  // Set up map
  private initMap(): void {
    this.map = L.map('resultmap', {
      center: [51.9606649, 7.6261347],
      zoom: 4,
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
    var testIcon = new L.Icon({
      iconUrl: this.APIURL + '/marker',
      iconSize: [27, 27],
    });
    this.trainAreasLayer = L.geoJSON(furtherTrainAreasGeoJSON.features, {
      pointToLayer: function (feature, latlng) {
        return new L.Marker(latlng, { icon: testIcon });
      },
    });

    // variables for colour setting
    const min = 1;
    const max = georasterPrediction.maxs[0];
    console.log(max)
    const range = max - min;

    // await the file with the used classes
    const classes = await fetch(this.classesUrl);
    const classesArray = await classes.json();

    // create array with the colours to be used for the classification
    const usedColours = [];
    var scale = chroma.scale('Viridis'); // define which color scheme we want to use
    for (let index = min; index <= max; index++) {
      usedColours.push(scale((index - min) / range).hex());
    }

    /**
     * Function that generates HTML code to dynamically add a legend to the result page
     * @param colourArray - Array of the colours
     * @param classesArray - Array of the classes
     * @returns an HTML String of all necessary elements for the legend and the matching style sheet
     */
    function makeLegendHTML(colourArray, classesArray) {
      var result = '';
      for (let index = 0; index < colourArray.length; index++) {
        result += `<li><span style='background: ${colourArray[index]};'></span>${classesArray[index]}</li>`;
      }
      result +=
        "<style type='text/css'>\
      .my-legend .legend-title {\
        text-align: left;\
        margin-bottom: 5px;\
        font-weight: bold;\
        font-size: 90%;\
        }\
      .my-legend .legend-scale ul {\
        margin: 0;\
        margin-bottom: 5px;\
        padding: 0;\
        float: left;\
        list-style: none;\
        }\
      .my-legend .legend-scale ul li {\
        font-size: 80%;\
        list-style: none;\
        margin-left: 0;\
        line-height: 18px;\
        margin-bottom: 2px;\
        }\
      .my-legend ul.legend-labels li span {\
        display: block;\
        float: left;\
        height: 16px;\
        width: 30px;\
        margin-right: 5px;\
        margin-left: 0;\
        border: 1px solid #999;\
        }\
      .my-legend .legend-source {\
        font-size: 70%;\
        color: #999;\
        clear: both;\
        }\
      .my-legend a {\
        color: #777;\
        }\
    </style>";
      return result;
    }

    // insert the created html code in the right position to display the legend
    document.getElementById('predictionLegend').innerHTML = makeLegendHTML(
      usedColours,
      classesArray
    );

    // creating prediction layer
    this.predictionLayer = new GeoRasterLayer({
      georaster: georasterPrediction,
      debugLevel: 1,
      opacity: 0.7,
      pixelValuesToColorFn: function (pixelValues) {
        var pixelValue = pixelValues[0]; // there's just one band in this raster
        if (pixelValue === null) return null;
        var scaledPixelValue = (pixelValue - min) / range;
        var color = scale(scaledPixelValue).hex();
        return color;
      },
      resolution: 64, // optional parameter for adjusting display resolution
    });
    //this.predictionLayer.addTo(this.map);
    console.log(this.predictionLayer);

    // creating aoa layer
    this.aoaLayer = new GeoRasterLayer({
      georaster: georasterAOA,
      debugLevel: 1,
      opacity: 0.7,
      pixelValuesToColorFn: (values) =>
        values[0] === 0 ? '#000000 ' : values[0] === 1 ? '#FFFFFF ' : null,
      resolution: 64, // optional parameter for adjusting display resolution
    });
    console.log(this.aoaLayer);

    // creating aoi layer
    // this.aoiLayer = new GeoRasterLayer({
    //   georaster: georasterAOI,
    //   debugLevel: 1,
    //   opacity: 0.7,
    //   resolution: 64, // optional parameter for adjusting display resolution
    // });
    // this.aoiLayer.addTo(this.map);
  }

  /**
   *
   * @param event Function that changes the opacity of an layer if someone uses the slidebar
   * @param name name of layer to be changed
   */
  changeOpacity(event, name) {
    if (name == 'prediction') {
      this.predictionLayer.setOpacity(event.value);
    } else if (name == 'aoa') {
      this.aoaLayer.setOpacity(event.value);
    }
  }

  /**
   * Function that wil be executed if a download button gets clicked
   * @param name name of file to be downloaded
   */
   downloadData(name) {
    if (name == 'prediction') {
      window.open(this.predictionUrl, '_blank');
    } else if (name == 'aoa') {
      window.open(this.aoaUrl, '_blank');
    } else if (name == 'trainAreas') {
      window.open(this.furtherTrainAreasJSONUrl,'_blank');
    } else if (name == 'aoi') {
      window.open(this.aoiUrl, '_blank');
    } else if (name == 'trainingData') {
      window.open(this.trainingDataTifUrl, '_blank');
    } else if (name == 'model') {
      window.open(this.modelUrl, '_blank');
    }
  }

  /**
   * Function that wil be executed if a checkbox gets clicked
   * @param name name of the layer to be shown
   */
  checkboxClicked(name) {
    if (name == 'prediction') {
      if (
        (<HTMLInputElement>document.getElementById('predictionCheckbox'))
          .checked
      ) {
        this.predictionLayer.addTo(this.map);
        this.map.flyToBounds(this.predictionLayer.getBounds())
      } else {
        this.map.removeLayer(this.predictionLayer);
      }
    } else if (name == 'aoa') {
      if ((<HTMLInputElement>document.getElementById('aoaCheckbox')).checked) {
        this.aoaLayer.addTo(this.map);
        this.map.flyToBounds(this.aoaLayer.getBounds())
      } else {
        this.map.removeLayer(this.aoaLayer);
      }
    } else if (name == 'trainAreas') {
      if (
        (<HTMLInputElement>document.getElementById('trainAreasCheckbox'))
          .checked
      ) {
        this.trainAreasLayer = this.trainAreasLayer.addTo(this.map);
        this.map.flyToBounds(this.trainAreasLayer.getBounds())
      } else {
        this.map.removeLayer(this.trainAreasLayer);
      }
    }
  }

  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  ngAfterViewInit(): void {
    this.initMap();
    this.createAllLayersFromTif();
  }
}
