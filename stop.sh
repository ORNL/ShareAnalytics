#!/bin/bash

set -e

# Script to start all containers

DOCKER_MAIN_DIR=$PWD

cd $DOCKER_MAIN_DIR/dashboardutility
docker-compose down

cd $DOCKER_MAIN_DIR/meanapp
docker-compose down

cd $DOCKER_MAIN_DIR/slurm
docker-compose down



