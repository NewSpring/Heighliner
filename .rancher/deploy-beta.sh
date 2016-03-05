#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"

deploy_image() {
  docker login -u $DOCKERHUB_USER -p $DOCKERHUB_PASSWORD -e $DOCKERHUB_EMAIL
  docker tag heighliner:latest newspring/heighliner:$CIRCLE_SHA1
  docker push newspring/heighliner:$CIRCLE_SHA1 | cat # workaround progress weirdness
}

deploy_image

export COMPOSE_FILE=.rancher/docker-compose.yml

rancher-compose -p heighliner-beta up -d --force-upgrade heighliner-beta
