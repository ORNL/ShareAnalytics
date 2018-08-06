This page offers a quick start guide to getting ShareAL up and running to test it out. For more details on dependencies, configuration
or developer related questions please see [Project Overview](projectoverview.md). 

## Preparation

* copy project folder onto Linux machine
* if using docker slurm cluster, verify Linux distro utilizes systemd. Otherwise, systemd is unnecessary
* make sure ports 3000 (web app), 3100 (grafana), 27017 (mongo) and 5000 (slurm web server) are open
* install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/)

## Launch

* for initial launch, run deploy.sh
* subsequently, use start.sh / stop.sh to start / stop the containers
* for web app, go to localhost:3000
* if using a physical HPC cluster, see [HPC Cluster](cluster.md)

## Usage

* See the [User Guide](userguide.md)

