#!/bin/bash

set -e

# Deploy docker containers
# Assumes this script is ran from the data-analytics/ directory
DOCKER_MAIN_DIR=$PWD

# Build all custom images
DOCKER_BUILD_DIR=`mktemp -d`
pushd $DOCKER_BUILD_DIR

cp -r $DOCKER_MAIN_DIR/slurm/base .
pushd base
docker build -t mcrslurm/base .
popd #base

cp -r $DOCKER_MAIN_DIR/slurm/head .
pushd head
docker build -t mcrslurm/head .
popd #head

cp -r $DOCKER_MAIN_DIR/slurm/compute .
pushd compute
docker build -t mcrslurm/compute .
popd #compute

cp -r $DOCKER_MAIN_DIR/meanapp .
pushd meanapp
docker build -t meanapp .
popd #meanapp

popd #$DOCKER_BUILD_DIR

# Now that required images are built, run the containers using docker-compose
cd $DOCKER_MAIN_DIR/slurm
docker-compose up -d --build

cd $DOCKER_MAIN_DIR/meanapp
docker-compose up -d --build

cd $DOCKER_MAIN_DIR/dashboardutility
docker-compose up -d --build