# Geosoft2Project
### Applicability Estimation Tool 
for Spatial Prediction Models

## Description
This application is a web- based service which provides users with an innovative machine learning toolkit for land use mapping. The unique feature of this toolkit is that it includes the AOA as a standard applicability estimation tool to more accurately assess the reliability of the resulting LULC predictions. In addition, it suggests locations for the collection of additional training data.

## Table of contents

- [How to install and run the app](#how-to-install-and-run-the-app)
- [How to use the app](#how-to-use-the-app)
  - [Demo](#demo)
  - [Main Tool](#main-tool)
  - [Results](#results)
- [How to test](#how-to-test)
- [Credits](#credits)
- [License](#license)

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

### Results
Description of result page. 


## How to test
To test this app you can proceed as follows:
How to test backen?  
How to test frontend?  
How to test R?  

## Credits

Project of the course Geosoftware 2 at the [Institute of Geoinformatics](https://www.uni-muenster.de/Geoinformatics/en/) by
[Jakob Dannel](https://github.com/jakobdanel)
[Fabian Schumacher](https://github.com/fab-scm)
[Thalis Goldschmidt](https://github.com/thalisgold)
[Henning Sander](https://github.com/Hes097)
[Frederick Bruch](https://github.com/fbruc03)

## License
Add license text here
