
#!/usr/bin/env bash
set -e

git clone $KUBERNETES_REPO
(cd kubernetes && git checkout $KUBERNETES_COMMIT)
KUBE_SKIP_CONFIRMATIONS=y ./kubernetes/build/run.sh hack/build-cross.sh
cp kubernetes/_output/dockerized/bin/linux/amd64/hyperkube hyperkube/hyperkube
docker build -t $IMAGE_NAME hyperkube