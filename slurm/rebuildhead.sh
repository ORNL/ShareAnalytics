#!/bin/bash

docker rmi mcrslurm/head --force
docker-compose down
cd head
docker build -t mcrslurm/head .
cd ..
docker-compose up