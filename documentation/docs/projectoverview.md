## References

For component specific references, please see the [WebApp](webapp.md), [HPC Cluster](cluster.md) and [Dashboard](dash.md) pages. 

* [Dockerfile](https://docs.docker.com/engine/reference/builder/)
* [Docker Networking](https://docs.docker.com/network/)
* [docker-compose](https://docs.docker.com/compose/)

## Dependencies

**WebApp**

It helps to have these dependencies for development and troublesehooting, but they are not required to launch the project in docker.  

* Install [Node.js](https://www.npmjs.com/get-npm)
* npm install -g bower
* npm install -g gulp

**HPC Cluster**

* Host machine must support systemd - /sys/fs/cgroup:ro is being mapped to folder in docker container

**Dashboard**

These dependencies are only required if you plan to use the provided sample scripts, which are written in python. 

* [python3](https://www.python.org/downloads/)<br/>
* pip install influxdb<br/>

## Configuration 

* in dashboardutility/docker-compose.yml change /tmp/influxstore to folder where InlfuxDB data will be persisted
* modify config/lib/express.js initLocalVariables() folder paths for results / analytics / datasets / dashboards folder if desired
* set those same paths in slurm/head/flask_startup.py and slurm/head/pushresults.py

## Security

By default, there is no proxy and http is used instead of https. In addition, the docker containers in the slurm cluster are running as root. If security is a concern, it would be helpful to:

* generate a key and certificate and place them in the meanapp/config/sslcerts folder (you will need to create this folder)
* change NODE_ENV in meanapp/docker-compose.yml to production instead of development, which will enable https
* modify docker containers so that they do not run as root user
* use a reverse proxy such as [nginx](https://www.nginx.com/resources/wiki/) 
* for more detailed security guidelines, see the [OWASP Web Application Security Testing Cheat Sheet](https://www.owasp.org/index.php/Web_Application_Security_Testing_Cheat_Sheet)

## Port Forwarding

ssh -L 3000:127.0.0.1:3000 -L 8086:127.0.0.1:8086 -L 35729:127.0.0.1:35729 -L 3100:127.0.0.1:3100 uname@remoteaddress

    3000   # WebApp
    8086   # InfluxDB
    35229  # Live Reload
    3100   # Grafana Dashboard

## Project layout

[dashboardutility](dash.md)/&nbsp;&nbsp;
    # [Grafana](https://grafana.com/) / [InfluxDB](https://www.influxdata.com/) based dashboard for analyzing streaming data<br/>
[meanapp](webapp.md)/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    # Web application for NILM facility characterization based upon [MEANJS](http://meanjs.org/) project<br/>
[slurm](cluster.md)/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          # [Slurm](https://slurm.schedmd.com/) cluster composed of five docker containers for running analytics and testing the platform<br/>
documentation/&nbsp;&nbsp;&nbsp;
    # Platform documentation written in [mkdocs](https://www.mkdocs.org/)<br/>

