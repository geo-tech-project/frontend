# Estimation Tool for Spatial Prediction Models

## Table of contents
- [Estimation Tool for Spatial Prediction Models](#estimation-tool-for-spatial-prediction-models)
  - [Table of contents](#table-of-contents)
  - [Authors](#authors)
  - [Abstract](#abstract)
  - [Area Of Applicability (AOA)](#area-of-applicability-aoa)
  - [Aim of the tool](#aim-of-the-tool)
  - [Target group](#target-group)
  - [How does the software work?](#how-does-the-software-work)
    - [Part 1: Satellite image generation (with R)](#part-1-satellite-image-generation-with-r)
      - [Generation of a Sentinel-2 satellite image for the area of interest (Sentinel Image (AOI))](#generation-of-a-sentinel-2-satellite-image-for-the-area-of-interest-sentinel-image-aoi)
      - [Generation of a Sentinel-2 satellite image for the areas where the training data is located (Sentinel Image (training area))](#generation-of-a-sentinel-2-satellite-image-for-the-areas-where-the-training-data-is-located-sentinel-image-training-area)
    - [Part 2: Model training (with R)](#part-2-model-training-with-r)
    - [Part 3: Prediction and AOA (with R)](#part-3-prediction-and-aoa-with-r)
  - [How to install and run the app](#how-to-install-and-run-the-app)
  - [How to use the app](#how-to-use-the-app)
    - [Main Tool](#main-tool)
    - [Demo](#demo)
    - [Output of the results](#output-of-the-results)
  - [How to test](#how-to-test)
  - [Dependencies](#dependencies)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Further Documentation](#further-documentation)
    - [Frontend](#frontend-1)
    - [Backend](#backend-1)
  - [Credits](#credits)
  - [License](#license)



## Authors
Project of the course Geosoftware 2 at the [Institute of Geoinformatics](https://www.uni-muenster.de/Geoinformatics/en/) by [Jakob Danel](https://github.com/jakobdanel), 
[Fabian Schumacher](https://github.com/fab-scm), 
[Thalis Goldschmidt](https://github.com/thalisgold), 
[Henning Sander](https://github.com/Hes097) and 
[Frederick Bruch](https://github.com/fbruc03) 

## Abstract
Machine learning methods have become very popular for spatial prediction efforts such as classifying remote sensing images, especially because of their ability to learn non-linear relationships and thereby solve more complex classifications tasks. A underestimated issue is that machine learning algorithms can only provide meaningful predictions when applied to data that is similar to the data they were trained on (Meyer and Pebesma, 2021). ”Similar” here refers to the value ranges of the predictor variables (such as different bands of the remote sensing image). When applying a trained machine learning algorithm to a new geographic area, it is unclear whether or not the pixels properties in that area are similar enough to the training data to enable a reliable classification.  

## Area Of Applicability (AOA)
The [Area Of Applicability](https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/2041-210X.13650) is a method developed by Meyer and Pebesma (2021) to delineate areas in spatial data (here remote sensing images) that can be assumed to be areas the machine learning model can reliably be applied to. The AOA provides important additional information that should be communicated when applying machine learning methods to spatial prediction tasks, especially when predicting on a large or even global scale when training data are not evenly distributed over the target area. 

## Aim of the tool
The tool combines all the steps needed to perform a land use/land cover classification (generation of satellite images, model training and prediction). In particular, it is designed to extend the previous steps by the AOA and adopt this method into the typical workflow of a remote scientist/researcher without having to deal with its concrete implementation. Besides delineating such an area of applicability (AOA), this tool can also be used to point to areas where collecting additional training data is needed to train a more applicable model. 

## Target group
Researchers and users of remote sensing methods who want to
* use machine learning for land use classifications
* work with sentinel-2 data
* know how to train and apply machine learning models, but are unable or unwilling to focus on understanding and implementing the Area of Applicability
* work with large-scale mapping/modeling applications, but lack the necessary hardware to perform machine learning and compute the AOA on large datasets

## How does the software work?
The user has the possibility to select a model to work with. He can either upload his own model via an upload button or create a new model in order to train it with a selectable machine-learning algorithm. Depending on his choice, only specific parts of the software will be executed.

### Input
* Area of interest: The area for which the land use classification and the aoa are to be calculated.
* Training data or model: If a new model should be created, training data must be uploaded. Otherwise a model is uploaded by the user.
* Machine learning algorithm and hyperparameters: The new model must be trained. For this, the user can choose between two machine-learning algorithms and, if desired, also pass hyperparameters.
* Time period: In that period, a search is made for available sentinel-2 images.
* Bands/ predictors: All bands/predictors to be included in the sentinel images.
* Resolution: Resolution of the sentinel images to be generated.
* Maximum cloud cover: The satellite imagery search is filtered by maximum cloud cover.

### Part 1: Satellite image generation (with R)
#### Generation of a Sentinel-2 satellite image for the area of interest (Sentinel Image (AOI))
* Based on the user inputs (area of interest (AOI) , time period and cloud cover), the Spatial Temporal Asset Catalog (STAC) is searched for matching Sentinel-2 satellite images.
* For each Sentinel-2 image found, all bands (except ```B10```) are available for download. We only continue to work with those that have been pre-selected by the user. 
* If many images are found, we limit ourselves to 200 for further calculation.
* All images (max 200) are now superimposed and for each pixel the median is calculated over all images for each band.
* This can be helpful to avoid the problem of cloud cover and other interfering factors. In other words, the more images that can be found, the more likely it is to get a good image for model training and LULC classification.

#### Generation of a Sentinel-2 satellite image for the areas where the training data is located (Sentinel Image (training area))
* The generation of a Sentinel-2 satellite image for the areas where the training data is located is only done if the user chose to create a new model and therefore has uploaded training data.
* It works analogously to the generation of the Sentinel-2 image for the AOI. Instead of filtering by the AOI, it filters by the geometry of the training polygons. Pixels outside the polygons are set to NA.

### Part 2: Model training (with R)
If the user selects to work with his own model, no further model training is needed. If the user selects to create a new model, some additional steps must be performed to obtain valid training data. The generated sentinel image of the training areas (consisting of all selected bands) is now combined with the information from the uploaded training data. Each pixel completely covered by a training polygon is assigned the class of the polygon. As a result we get a dataset of all overlaid pixels, their assigned class and spectral information that we can now use to generate the model. 

The user can choose whether he wants to train the model with an random forest or with a support vector machine. For both, hyperparameters can be set and the model is validated with a spatial cross validation method, omitting whole training polygons.

### Part 3: Prediction and AOA (with R)
With the help of the trained model and the generated sentinel image for the AOI, a prediction is now calculated. In order to be able to make statements about the applicability of the model especially on unknown areas, the AOA is computed. In the areas where the model is not applicable according to the AOA, random points are generated that are suggested to the user as potential new locations for generating new training data. If this data is acquired in these areas and incorporated into the model, better results could be obtained.

## How to install and run the app

To make it as simple as possible we used [Docker](https://www.docker.com) for the development. The only thing necessary to run this software, is to download this repository and run `docker-compsoe up --build`in the command line interface. This installs all dependencies for the front- and backend including all [R](https://www.r-project.org) packages. As these packages are not that small, this step could take up to one hour of building time (depending on your hardware). After building, the application will start automatically and you can access the webtool at `http://localhost:8780`. If you have terminated the application and want to restart it another time you can just leave out the `--build` tag of the `docker-compose up` command to start the app again.  


## How to use the app

### Main Tool
The main tool is designed in such a way that the user can use it very easily. The user is guided step by step and can only proceed to the next step if the previous one has been carried out correctly. For each step there is an additional info button that displays important information as soon as you hover over it. When everything has been entered successfully, the calculations can be started. After the calculations have been executed and no errors have occurred, the user will be directed to the results page.
![Main Tool page](/src/assets/main-tool.jpg?raw=true)

### Demo
The demo page is structured exactly like the actual tool. However, all inputs have already been entered with default values. The user can view these entries, but not change them. He is only able to start the calculations by clicking on the ```Run demo``` button. The user should be redirected to the results page in less than 20 seconds.
![Demo page](/src/assets/demo.jpg?raw=true)

### Output of the results
On a new route, the following three results are visualised on a map: 
* Prediction: Land use/ land cover classification
* Area of Applicabilty (AOA)
* Further train areas

It is possible to show and hide the individual results using a checkbox and even to adjust their transparency. The underlying satellite images on which the calculations are based are not displayed on the map but can be downloaded in the same way as the other results via a download button. Please note that the sentinel image of the training areas can only be downloaded if training data has been submitted.
![Result page](/src/assets/results_complete.jpg?raw=true)



## How to test
To test this app you can proceed as follows:  
How to test backen?  
How to test frontend?  
How to test R?
The tests are written in the R package [testthat](https://testthat.r-lib.org/)
Requirements:
- Installation of R
- Installation all R packages used in this project
- Installation of Node.js

Proceed the following steps.
1. Make a clone of the backend repository
2. Navigate into the backend/test folder
3. run node testR.js  

## Dependencies
The following packages are used in this project:
### Frontend
As normal dependencies:
-  "@angular/animations": "~12.1.1",
-  "@angular/cdk": "^12.2.12",
-  "@angular/common": "~12.1.1",
-  "@angular/compiler": "~12.1.1",
-  "@angular/core": "~12.1.1",
-  "@angular/forms": "~12.1.1",
-  "@angular/material": "^12.2.12",
-  "@angular/platform-browser": "~12.1.1",
-  "@angular/platform-browser-dynamic": "~12.1.1",
-  "@angular/router": "~12.1.1",
-  "@asymmetrik/ngx-leaflet": "^8.1.0",
-  "@asymmetrik/ngx-leaflet-draw": "^7.0.0",
-  "@creativebulma/bulma-tooltip": "^1.2.0",
-  "@fortawesome/angular-fontawesome": "^0.9.0",
-  "@fortawesome/fontawesome-svg-core": "^1.2.36",
-  "@fortawesome/free-brands-svg-icons": "^5.15.4",
-  "@fortawesome/free-regular-svg-icons": "^5.15.4",
-  "@fortawesome/free-solid-svg-icons": "^5.15.4",
-  "ace-builds": "^1.4.13",
-  "better-docs": "^2.7.1",
-  "bootstrap": "^5.1.3",
-  "bulma": "^0.9.3",
-  "bulma-slider": "^2.0.4",
-  "bulma-toast": "^2.4.1",
-  "chroma-js": "^2.1.2",
-  "font-awesome": "^4.7.0",
-  "geoblaze": "^1.0.3",
-  "georaster": "^1.5.6",
-  "georaster-layer-for-leaflet": "^3.5.0",
-  "leaflet": "^1.7.1",
-  "leaflet-draw": "^1.0.4",
-  "leaflet-geotiff": "^0.2.0",
-  "leaflet-geotiff-2": "^1.1.0",
-  "ng2-file-upload": "^1.4.0",
-  "ngx-markdown": "^13.0.0",
-  "rxjs": "~6.6.0",
-  "tslib": "^2.2.0",
-  "typedoc": "^0.22.11",
-  "zone.js": "~0.11.4"
As development dependencies:
- "@angular-devkit/build-angular": "~12.1.1",
- "@angular/cli": "~12.1.1",
- "@angular/compiler-cli": "~12.1.1",
- "@types/jasmine": "~3.6.0",
- "@types/leaflet": "^1.7.5",
- "@types/leaflet-draw": "^1.0.5",
- "@types/node": "^12.11.1",
- "jasmine-core": "~3.7.0",
- "karma": "~6.3.0",
- "karma-chrome-launcher": "~3.1.0",
- "karma-coverage": "~2.0.3",
- "karma-jasmine": "~4.0.0",
- "karma-jasmine-html-reporter": "^1.5.0",
- "typescript": "~4.3.2"

### Backend
Javascript packages:
- "axios": "^0.24.0",
- "body-parser": "^1.19.0",
- "chai": "^4.3.4",
- "cors": "^2.8.5",
- "dotenv": "^10.0.0",
- "express": "^4.17.1",
- "mocha": "^9.1.4",
- "multer": "^1.4.3",
- "ng2-file-upload": "^1.4.0",
- "nodemon": "^2.0.15",
- "r-integration": "^1.4.0",
- "supertest": "^6.2.2",
- "swagger-ui-express": "^4.3.0"

R packages:
- terra
- rgdal
- rgeos
- rstac
- gdalcubes
- raster
- caret
- CAST
- lattice
- Orcs
- jsonlite
- tmap
- latticeExtra
- doParallel
- parallel
- sp
- geojson
- rjson
- randomForest


## Further Documentation

The software can be split into two essential parts. The frontend was developed with the web framework [Angular](https://angular.io).
The backend is setup as a Node.js application using the [Express](https://expressjs.com/) framework. 

### Frontend
Documentation of the frontend written in Angular, with HTML, CSS and TypeScript: [Frontend](http://35.80.3.64:8781/frontend)

### Backend
The backend can be devided into three parts. The first part are the R scripts that are used to perform the actual operations, e.g. generating the sentinel images or calculating the AOA. The second part is the API that establishes the connection between the back- and frontend. The last part is the Javascript code that sets up the API and connects to the R-part. Please note that the following links can only be used from the internet network of the University of Münster.
- [R-Scripts](http://35.80.3.64:8781/R)
- [API](http://35.80.3.64/documentation)
- [Javascript](http://35.80.3.64/js)

## Credits
Credits

## License
Add license text here


