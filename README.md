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

## Target group
Researchers and users of remote sensing methods who want to
* use machine learning for land use classifications
* work with sentinel-2 data
* know how to train and apply machine learning models, but are unable or unwilling to focus on understanding and implementing the Area of Applicability
* work with large-scale mapping/modeling applications, but lack the necessary hardware to perform machine learning and compute the AOA on large datasets

## How does the software work?
The user has the possibility to select a model to work with. He can either upload his own model via an upload button or create a new model in order to train it with a selectable machine-learning algorithm. Depending on his choice, only specific parts of the software will be executed.

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

### Demo
Description of what can be done on the demo page. 
![Demo page](/src/assets/demo-page-view.png?raw=true)

### Main Tool
Description of main tool. 
![Main Tool page](/src/assets/main-page-view.png?raw=true)

### Output of the results
* Prediction: Land use/ land cover classification based on a given model.
* Area of Applicabilty (AOA): 
* Further train areas:
* Sentinel image (AOI):
* Sentinel image (training areas):
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


