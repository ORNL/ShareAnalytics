## References

* [MEANJS](http://meanjs.org/docs/0.5.x/)
* [Directives](https://docs.angularjs.org/guide/directive)
* [Services](https://docs.angularjs.org/guide/services)

## Accessing Web App

* go to localhost:3000

## Launching the App Using Docker

1. CD into directory and type docker-compose up
2. For subsequent runs, run docker-compose up --build 
3. Application will live reload when files are changed

## Adding New Bower and Node Packages

For bower, must add reference to .js and .css files to config/assets/default.js and package name to modules/core/client/app/config.js. It will then be necessary to rebuild the docker image so that new 
dependencies will be pulled. At this point they can be injected into controllers and used as desired. 

Node packages can be added to package.json and require no additional configuration. Simply include them
using require('packagename'). Read the docs to verify no extra configuration is required. 

## Adding Directives and Services 

New directives can be added to the modules/core/client/directives folder. Directives are the correct way to add custom javascript behavior in AngularJS. Services belong in modules/core/client/services and provide an efficient means of dependency injection. 

## Using the OpenLayers Map Offline

In some cases, the user may not want to allow the application to access resources external to the network. Currently the map displayed on the dashboard requires such access. However, [TileServerGL](http://tileserver.org/) enables the user to use openstreetmaps offline by serving the tiles locally. Further information on this process can be found at [OpenMapTiles.org](https://openmaptiles.org/docs/). In order to use the local tile server once it is set up, simply change the source of the map in /meanapp/modules/core/directives/olmap.client.directive.js. Instructions for how to alter the
OpenLayers (ol) map source are included in the comments. Change ol.source.OSM() to ol.source.XYZ() and provide the appropriate 
url. 

## Adding Features to OpenLayers Map

The map is being displayed using a custom directive located at meanapp/modules/core/client/directives/olmap.client.directive.js. If it is desirable to add additional features on the map, simply edit this map directive. Follow this link for the OpenLayers 3 [API Reference](http://geoadmin.github.io/ol3/apidoc/). 

## Analytic File Types

Available analytic types are being set in the 'vm.analytictypes' variable in meanapp/modules/analytics/client/controllers/form-analytic.client.controller.js. It currently includes python, bash, matlab and executable file types. If adding analytic types, modifications will need to be made to dashboardutility/head/flask_startup.py to handle all file types that will be passed to the flask web server. 

## Seeding the Database

* both admin / user already seeded - just need to copy password from the console output
* see env/development.js for examples of seeding the database
* multiple entries can be input into the 'docs' object
* skip condition prevents seeding if articles already exist if that behavior is desired

## Using Markdown

- use 'markdown' inside html tag
- ngSanitize is being used to sanitize before displaying to the client
- however, every field that allows markdown as input needs to be sanitized server side before being stored
- when adding markdown to new fields, make sure to sanitize

## Ports

- 5858 - debugger port
- 3000 - web app
- 27017 - mongo
- 35729 - live reload
- 8080 - node-inspector

## Project layout

    config/
        config.js           # Configuration file
        assets/             # Packages added to bower or /public/packages must add them here in default.js
        env/                # Environment variables such as port, host, etc.
        lib/                # Library files
    modules/                # Modules contain both client side (AngularJS) and server side (NodeJS) code
        analytics/          # Module for managing analytics
        core/               # Core module is the main module and includes both templates and config files
        dashboards/         # Module for dashboards
        datasets/           # Module for managing datasets
        filehandler/        # Node module for storing and retrieving files
        influxdb/           # Module for interacting with InfluxDB
        locations/          # Module for defining locations
        results/            # Module for storing and displaying results
        slurm/              # Node module for interacting with slurm web server
        users/              # User module for authentication
    public/       
        packages/           # Directory to hold packages manually installed rather than using bower/npm
        manifest.json       # Metadata for /core/server/views/layout.server.view.html
    scripts/                # Helper scripts provided with MEANJS framework
    bower.json              # All bower based dependencies listed here
    package.json            # All node based dependencies listed here


    
    
