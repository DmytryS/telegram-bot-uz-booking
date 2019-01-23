#!/usr/bin/env bash
set -e

export TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo "latest"; else echo $TRAVIS_BRANCH ; fi`
export COMMIT=${TRAVIS_COMMIT::8}

docker build -f Dockerfile -t $REPO:$COMMIT ../bot
docker tag $REPO:$COMMIT $REPO:$TAG
docker tag $REPO:$COMMIT $REPO:travis-$TRAVIS_BUILD_NUMBER
docker push $REPO