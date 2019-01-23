#!/usr/bin/env bash
set -e

export TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo "latest"; else echo $TRAVIS_BRANCH ; fi`
# export COMMIT=${TRAVIS_COMMIT::8}

docker build -f Dockerfile -t $REPO:$COMMIT ../bot
