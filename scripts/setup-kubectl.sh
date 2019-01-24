#!/bin/sh

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

export KUBECONFIG=${HOME}/.kube/config

mkdir ${HOME}/.kube

echo $KUBE_CLUSTER_CERTIFICATE | base64 --decode >>  ${HOME}/.kube/ca.pem
echo $KUBE_CLIENT_KEY | base64 --decode >>  ${HOME}/.kube/admin-key.pem
echo $KUBE_CLIENT_CERTIFICATE | base64 --decode >>  ${HOME}/.kube/admin-cert.pem

kubectl config set-credentials $KUBE_CLUSTER_USERNAME --username=$KUBE_CLUSTER_USERNAME --client-certificate=${HOME}/.kube/admin-cert.pem --client-key=${HOME}/.kube/admin-key.pem
kubectl config set-cluster $KUBE_CLUSTER_NAME --server=$KUBE_CLUSTER_IP --certificate-authority=${HOME}/.kube/ca.pem
kubectl config set-context $KUBE_CLUSTER_CONTEXT --user=$KUBE_CLUSTER_USERNAME --namespace=default --cluster=$KUBE_CLUSTER_NAME
kubectl config use-context $KUBE_CLUSTER_CONTEXT

kubectl get pods --all-namespaces