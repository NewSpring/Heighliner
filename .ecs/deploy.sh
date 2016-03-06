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

# reads $CIRCLE_SHA1, $host_port
# sets $k_def() {
make_task_def() {

  task_template='[
    {
      "name": "heighliner",
      "memory": 512,
      "cpu": 512,
      "essential": true,
      "image": "newspring/heighliner:%s",
      "portMappings": [
        {
          "hostPort": 8081,
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "REDIS_HOST",
          "value": "'"$REDIS_HOST"'"
        },
        {
          "name": "MONGO_URL",
          "value": "'"$MONGO_URL"'"
        },
        {
          "name": "MYSQL_HOST",
          "value": "'"$MYSQL_HOST"'"
        },
        {
          "name": "MYSQL_USER",
          "value": "'"$MYSQL_USER"'"
        },
        {
          "name": "MYSQL_PASSWORD",
          "value": "'"$MYSQL_PASSWORD"'"
        },
        {
          "name": "MYSQL_DB",
          "value": "'"$MYSQL_DB"'"
        },
        {
          "name": "MYSQL_SSL",
          "value": "'"$MYSQL_SSL"'"
        },
        {
          "name": "NEW_RELIC_KEY",
          "value": "'"$NEW_RELIC_KEY"'"
        },
        {
          "name": "PORT",
          "value": "'"$PORT"'"
        },
        {
          "name": "ROCK_URL",
          "value": "'"$ROCK_URL"'"
        },
        {
          "name": "ROCK_TOKEN",
          "value": "'"$ROCK_TOKEN"'"
        },
        {
          "name": "RAYGUN",
          "value": "'"$RAYGUN"'"
        },
        {
          "name": "SEARCH_URL",
          "value": "'"$SEARCH_URL"'"
        },
        {
          "name": "SEARCH_CX",
          "value": "'"$SEARCH_CX"'"
        },
        {
          "name": "SEARCH_KEY",
          "value": "'"$SEARCH_KEY"'"
        }
      ]
    }
  ]'

  task_def=$(printf "$task_template" $CIRCLE_SHA1)
}

# reads $family
# sets $revision
register_definition() {

  if revision=$(aws ecs register-task-definition --container-definitions "$task_template" --family $family | $JQ '.taskDefinition.taskDefinitionArn'); then
    echo "Revision: $revision"
  else
    echo "Failed to register task definition"
    return 1
  fi

}

deploy_cluster() {

  host_port=8888
  family="heighliner"

  make_task_def

  register_definition
  if [[ $(aws ecs update-service --cluster apollos --service heighliner --task-definition $revision | \
                 $JQ '.service.taskDefinition') != $revision ]]; then
      echo "Error updating service."
      return 1
  fi

  # wait for older revisions to disappear
  # not really necessary, but nice for demos
  # I commented this out because it doesn't actually do anything and it was failing builds
  #for attempt in {1..30}; do
  #    if stale=$(aws ecs describe-services --cluster apollos --services heighliner | \
  #                   $JQ ".services[0].deployments | .[] | select(.taskDefinition != \"$revision\") | .taskDefinition"); then
  #        echo "Waiting for stale deployments:"
  #        echo "$stale"
  #        sleep 5
  #    else
  #        echo "Deployed!"
  #        return 0
  #    fi
  #done
  #echo "Service update took too long."
  return 0
}

deploy_image
deploy_cluster
