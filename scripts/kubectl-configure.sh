#!/usr/bin/env bash

set -e


# gcloud components update kubectl
# gcloud auth activate-service-account --key-file "${GOOGLE_APPLICATION_CREDENTIALS}"
# gcloud config set project $PROJECT_ID
# gcloud config set compute/zone $ZONE.

mkdir /home/travis/.kube
echo ${KUBE_CLUSTER_CONFIG} >> /home/travis/.kube/config
export KUBECONFIG=$KUBECONFIG:/home/travis/.kube/config
