#!/usr/bin/env bash
set -e

docker login -e thesamet@gmail.com -u thesamet -p $BINTRAY_API_KEY https://thesamet-docker-registry.bintray.io
echo Pushing $IMAGE_NAME
docker push $IMAGE_NAME

curl -uthesamet:$BINTRAY_API_KEY -X PUT \
  "https://api.bintray.com/content/thesamet/kubernetes/kubernetes/${KUBE_REV}/${KUBE_REV}/linux-amd64/kubelet?publish=1" -T kubernetes/_output/dockerized/bin/linux/amd64/kubelet

curl -uthesamet:$BINTRAY_API_KEY -X PUT \
  "https://api.bintray.com/content/thesamet/kubernetes/kubernetes/${KUBE_REV}/${KUBE_REV}/linux-amd64/kubectl?publish=1" -T kubernetes/_output/dockerized/bin/linux/amd64/kubectl

curl -uthesamet:$BINTRAY_API_KEY -X PUT \
  "https://api.bintray.com/content/thesamet/kubernetes/kubernetes/${KUBE_REV}/${KUBE_REV}/darwin-amd64/kubectl?publish=1" -T kubernetes/_output/dockerized/bin/darwin/amd64/kubectl

echo =====================================
echo Pushed image $IMAGE_NAME
echo Uploaded artifacts for $KUBE_REV