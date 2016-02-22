#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"

deploy_image() {
  docker login -e $DOCKERHUB_EMAIL -p $DOCKERHUB_PASSWORD
  docker tag heighliner:latest newspring/heighliner:$CIRCLE_SHA1
  docker push newspring/heighliner:$CIRCLE_SHA1 | cat # workaround progress weirdness
}

deploy_image

rancher-compose -p heighliner up -d --upgrade heighliner
