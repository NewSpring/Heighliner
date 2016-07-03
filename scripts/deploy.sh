#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"

deploy_image() {
  docker login -u $DOCKERHUB_USER -p $DOCKERHUB_PASSWORD -e $DOCKERHUB_EMAIL
  docker tag heighliner:latest newspring/heighliner:$TRAVIS_COMMIT
  # docker push newspring/heighliner:$TRAVIS_COMMIT | cat # workaround progress weirdness
}

# reads $TRAVIS_COMMIT, $host_port
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
        { "hostPort": 8081, "containerPort": 80, "protocol": "http" }
      ],
      "environment": [
        { "name": "NODE_ENV", value": "production" },
        { "name": "REDIS_HOST", "value": "'"$PROD_REDIS_HOST"'" },
        { "name": "MONGO_URL", "value": "'"$PROD_MONGO_URL"'" },
        { "name": "MYSQL_HOST", "value": "'"$PROD_MYSQL_HOST"'" },
        { "name": "MYSQL_USER", "value": "'"$PROD_MYSQL_USER"'" },
        { "name": "MYSQL_PASSWORD", "value": "'"$PROD_MYSQL_PASSWORD"'" },
        { "name": "MYSQL_DB", "value": "'"$PROD_MYSQL_DB"'" },
        { "name": "MYSQL_SSL", "value": "'"$PROD_MYSQL_SSL"'" },
        { "name": "NEW_RELIC_KEY", "value": "'"$PROD_NEW_RELIC_KEY"'" },
        { "name": "PORT", "value": "'"$PORT"'" },
        { "name": "ROCK_URL", "value": "'"$PROD_ROCK_URL"'" },
        { "name": "ROCK_TOKEN", "value": "'"$PROD_ROCK_TOKEN"'" },
        { "name": "SEARCH_URL", "value": "'"$PROD_SEARCH_URL"'" },
        { "name": "SEARCH_CX", "value": "'"$PROD_SEARCH_CX"'" },
        { "name": "SEARCH_KEY", "value": "'"$PROD_SEARCH_KEY"'" },
        { "name": "MSSQL_HOST", "value": "'"$PROD_MSSQL_HOST"'" },
        { "name": "MSSQL_USER", "value": "'"$PROD_MSSQL_USER"'" },
        { "name": "MSSQL_PASSWORD", "value": "'"$PROD_MSSQL_PASSWORD"'" },
        { "name": "MSSQL_DB", "value": "'"$PROD_MSSQL_DB"'" },
        { "name": "MSSQL_INSTANCE", "value": "'"$PROD_MSSQL_INSTANCE"'" },
        { "name": "TRACER_APP_KEY", "value": "'"$PROD_TRACER_APP_KEY"'" }
      ]
    }
  ]'

  task_def=$(printf "$task_template" $CIRCLE_SHA1)
}

# reads $family
# sets $revision
register_definition() {

  if revision=$(aws ecs register-task-definition --container-definitions "$task_def" --family $family | $JQ '.taskDefinition.taskDefinitionArn'); then
    echo "Revision: $revision"
  else
    echo "Failed to register task definition"
    return 1
  fi

}

deploy_cluster() {

  host_port=8081
  family="heighliner"

  make_task_def

  register_definition
  # if [[ $(aws ecs update-service --cluster apollos --service heighliner --task-definition $revision | \
  #                $JQ '.service.taskDefinition') != $revision ]]; then
  #     echo "Error updating service."
  #     return 1
  # fi

  return 0
}

deploy_image
deploy_cluster
