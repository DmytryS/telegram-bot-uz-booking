#!/usr/bin/env bash

set -e

# Build jar
gradle clean build

#Build image
docker build --no-cache=true -t $1 .