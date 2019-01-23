#!/bin/sh
 
# Install kubernetes and set config
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
# curl -o config https://$GITHUB_ACCESS_TOKEN@raw.githubusercontent.com/GithubOrganization/MySecretInfrastructureRepo/master/.kube/config

export KUBECONFIG=${HOME}/.kube/config

mkdir ${HOME}/.kube
# touch ${HOME}/.kube/config
# cp ./scripts/config ${HOME}/.kube/config
 
# # Fill out missing params in kubectl config file

echo $KUBE_CLUSTER_CERTIFICATE | base64 --decode >>  ${HOME}/.kube/ca.pem
echo $KUBE_CLIENT_KEY | base64 --decode >>  ${HOME}/.kube/admin-key.pem
echo $KUBE_CLIENT_CERTIFICATE | base64 --decode >>  ${HOME}/.kube/admin-cert.pem

# kubectl config --kubeconfig=config set-cluster $KUBE_CLUSTER_NAME --server=$KUBE_CLUSTER_IP --certificate-authority=./ca.pem --embed-certs=true
# kubectl config --kubeconfig=config set-context $KUBE_CLUSTER_CONTEXT --cluster=$KUBE_CLUSTER_NAME --user=$KUBE_CLUSTER_USERNAME
# # kubectl config set clusters.$KUBE_CLUSTER_NAME.certificate-authority-data "$KUBE_CLUSTER_CERTIFICATE"
# kubectl config --kubeconfig=config set-credentials $KUBE_CLUSTER_USERNAME  --client-certificate=./admin-cert.pem --client-key=./admin-key.pem
# # kubectl config set users.$KUBE_CLUSTER_USERNAME.client-certificate-data "$KUBE_CLIENT_CERTIFICATE"
# # kubectl config set users.$KUBE_CLUSTER_USERNAME.client-key-data "$KUBE_CLIENT_KEY"
# #kubectl config set current-context "$KUBE_CLUSTER_CONTEXT"
# echo "\nuse-context\n"
# kubectl config use-context "$KUBE_CLUSTER_CONTEXT"

kubectl config set-credentials $KUBE_CLUSTER_USERNAME --username=$KUBE_CLUSTER_USERNAME --client-certificate=${HOME}/.kube/admin-cert.pem --client-key=${HOME}/.kube/admin-key.pem
kubectl config set-cluster $KUBE_CLUSTER_NAME --server=$KUBE_CLUSTER_IP --certificate-authority=${HOME}/.kube/ca.pem
kubectl config set-context $KUBE_CLUSTER_CONTEXT --user=$KUBE_CLUSTER_USERNAME --namespace=default --cluster=$KUBE_CLUSTER_NAME
kubectl config use-context $KUBE_CLUSTER_CONTEXT
# sudo update-ca-certificates


kubectl get pods --all-namespaces