#!/usr/bin/env bash

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag $REPO:$COMMIT $REPO:$TAG
docker tag $REPO:$COMMIT $REPO:travis-$TRAVIS_BUILD_NUMBER
docker push $REPO