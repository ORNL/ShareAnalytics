#!/bin/bash

set -e

# Build Docker images for SLURM cluster
# Assumes this script is ran from the data-analytics/walking-skeleton/slurm/docker directory

# TODO replace with a YML script and merge with runSLURM

DOCKER_SLURM_DIR=$PWD

# Build images
# Inheritance is used to define these Docker images, the images aren't in the public repos, so base must be built locally first
DOCKER_BUILD_DIR=`mktemp -d`
pushd $DOCKER_BUILD_DIR

cp -r $DOCKER_SLURM_DIR/base .
pushd base
docker build -t mcrslurm/base .
popd #base

cp -r $DOCKER_SLURM_DIR/head .
pushd head
docker build -t mcrslurm/head .
popd #head

cp -r $DOCKER_SLURM_DIR/compute .
pushd compute
docker build -t mcrslurm/compute .
popd #compute

popd #$DOCKER_BUILD_DIR

# Create network
#docker network create --driver bridge --subnet=172.18.0.0/16 mcrslurm_net

