## References

* [Grafana](http://docs.grafana.org/)

## Accessing Grafana

* go to localhost:3100

## Configuring Data Source

If the example scripts and default configuration were used, enter the following values when creating in a new data source for a dashboard in Grafana to try it out:

* root/root for username and password
* 'example' for the database name
* no proxy 

## Adding Plugins

Additional plugins for grafana can be found [here](https://grafana.com/plugins). In order to add these plugins, simply 
append the plugin name to the following line in env.grafana:

* GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-worldmap-panel,briangann-gauge-panel,natel-plotly-panel,grafana-simple-json-datasource

## Ingesting New Data

Data can be ingested using any api that is interoperable with InfluxDB. For the purposes of demonstration, we
have provided example python scripts for generating test data and ingesting it. Below are instructions to use
the provided example scripts. 

- assuming all ports were mapped correctly, should be able to run these scripts from the host machine
- if not, can use 'docker exec -it [containerid] /bin/bash' to get a terminal inside the container
- create sample data with gendata.py
- to customize data type and format, modify 'values' inside the script
- ex: python gendata.py example.csv 10000 (#seconds to generate)
- to get total points - do #values * #seconds (three sensor values * 10000 seconds = 30K points)
- use the ingest.py python script once docker containers running to ingest data
- ex: python ingest.py example.csv 

## Single Login

It may be desirable to have a single login for the webapp and grafana. The following settings can be added 
to env.grafana to allow proxy authentication. However, keep in mind that if you choose this route security
may be in issue. There is the option to whitelist IP addresses that are allowed to use the X-WEBAUTH-USER token. 

GF_AUTH_PROXY_ENABLED = true<br/>
GF_AUTH_PROXY_HEADER_NAME = X-WEBAUTH-USER<br/>
GF_AUTH_PROXY_HEADER_PROPERTY = true<br/>
GF_AUTH_PROXY_AUTO_SIGN_UP = true<br/>

For more details, see this article on [grafana authproxy](https://grafana.com/blog/2015/12/07/grafana-authproxy-have-it-your-way/)

## Example Queries

#### Select Last Value

* SELECT last("value") FROM "collectionname" WHERE time < now()

#### Worldmap Panel

* with geohash as a field this query gives last known point
* SELECT last("geohash") AS "geohash", last("value") AS "metric",last("title") as "title" FROM "humidityloc0" WHERE time < now()
* go to 'WorldMap' tab and set Location Data to 'table' under 'Map Data Options'
* set 'Table Label Field' under 'Map Data Options' to 'title' or whichever field you want to be the label on the map - just make sure it is included in the query
* on Metrics tab set 'FORMAT AS' to Table

## Project layout

    docker-compose.yml  # Docker Compose file
    env.grafana         # Grafana configuration file
    env.influxdb        # InfluxDB configuration file
    example.csv         # Sample Data
    feeddata.py         # Script to feed sample data to InfluxDB
    gendata.py          # Script to generate sample data
    geohash.py          # Library to convert (lat,long) to geohash
    ingest.py           # Ingest data into InfluxDB