# Estimation Tool for Spatial Prediction Models

## Table of contents

- [Authors](#authors)
- [Description](#description)
- [Area Of Applicability (AOA)](#area-of-applicability-(aoa))
- [Who is the software for?](#who-is-the-software-for?)
- [How does the software work?](#how-does-the-software-work?)
  - [Part 1: Satellite image generation (with R)](#part-1:-satellite-image-generation-(with-r))
  - [Part 2: Model training (with R)](#part-2:-model-training-(with-r))
  - [Part 3: Prediction and AOA (with R)](#part-3:-prediction-and-aoa-(with-r))
  - [Part 4: Output of the results](#part-4:-output-of-the-results)
- [How to install and run the app](#how-to-install-and-run-the-app)
- [How to use the app](#how-to-use-the-app)
  - [Demo](#demo)
  - [Main Tool](#main-tool)
  - [Results](#results)
- [How to test](#how-to-test)
- [Credits](#credits)
- [License](#license)

## Authors
Project of the course Geosoftware 2 at the [Institute of Geoinformatics](https://www.uni-muenster.de/Geoinformatics/en/) by [Jakob Danel](https://github.com/jakobdanel), 
[Fabian Schumacher](https://github.com/fab-scm), 
[Thalis Goldschmidt](https://github.com/thalisgold), 
[Henning Sander](https://github.com/Hes097) and 
[Frederick Bruch](https://github.com/fbruc03)  

## Description

## Area Of Applicability (AOA)

## Who is the software for?

## How does the software work?

### Part 1: Satellite image generation (with R)
#### Generation of a Sentinel-2 satellite image for the area of interest (Sentinel Image (AOI))
* Based on the user inputs (AOI , time period and cloud cover), the Spatial Temporal Asset Catalog (STAC) is searched for matching Sentinel-2 satellite images. What kind of images? What quality? 
* For each Sentinel-2 image found, all bands (except band 10) are available for download. We only continue to work with those that have been pre-selected by the user. 
* If many images are found, we limit ourselves to 200 for further calculation.
* All images (max 200) are now superimposed and for each pixel the median is calculated over all images for each band.
* This can be helpful to avoid the problem of cloud cover and other interfering factors. In other words, the more images that can be found, the more likely it is to get a good image for model training and LULC classification.

#### Generation of a Sentinel-2 satellite image for the areas where the training data is located (Sentinel Image (training area))
* The generation of a Sentinel-2 satellite image for the areas where the training data is located is only done if training data has been uploaded by the user.
* It works analogously to the generation of the Sentinel-2 image for the AOI. Instead of filtering by the AOI, it filters by the geometry of the training polygons. Pixels outside the polygons are set to NA.

### Part 2: Model training (with R)
The user has the possibility to select a model for the calculations. He can either upload his own model via an upload button or create a new model in order to train it with a selectable machine-learning algorithm. If the user selects to work with his own model, no further model training is needed. If the user selects to create a new model, additional training data is required to train the model.


### Part 3: Prediction and AOA (with R)

### Part 4: Output of the results

## How to install and run the app
To make it as simple as possible we use [Docker](https://www.docker.com) for development so you only need to download this repository and run `docker-compsoe up --build`in your command line interface. This installs all dependencies for the font- and backend including all [R](https://www.r-project.org) packages. As these packages are not too small this step could take up to 1 hour of building time (depending on your hardware).  
After building, the application will start automatically and you can access the webtool at `http://localhost:8780`.  
If you have terminated the application and want to start it back up another time you can just leave out the `--build` tag of the `docker-compose up` command to start the app again.  

## How to use the app

### Demo
Description of what can be done on the demo page. 
![Demo page](/src/assets/demo-page-view.png?raw=true)

### Main Tool
Description of main tool. 
![Main Tool page](/src/assets/main-page-view.png?raw=true)

### Results
Description of result page. 
![Result page](/src/assets/result-page-view.png?raw=true)


## How to test
To test this app you can proceed as follows:  
How to test backen?  
How to test frontend?  
How to test R?  

## Credits
Credits

## License
Add license text here


