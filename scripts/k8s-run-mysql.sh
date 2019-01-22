#!/usr/bin/env bash

set -e

kubectl create -f mysql-deployment.yml
kubectl create -f mysql-service.yml