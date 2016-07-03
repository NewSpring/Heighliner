#!/usr/bin/env sh

echo $TRAVIS_PULL_REQUEST
echo $TRAVIS_TAG
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "This is a pull request. No deployment will be done."
  exit 0
fi

# if [[ "$TRAVIS_BRANCH" != "master" ]]; then
#   echo "Testing on a branch other than master. No deployment will be done."
#   exit 0
# fi

if [ "$TRAVIS_TAG" == "" ]; then
  echo "No tags found, no need for a release."
  exit 0
fi

YELLOW=`tput setaf 3`
yecho () {
  echo "${YELLOW}$1"
}

# force script to error out at first error
set -e

CURRENT_TAG=`git describe --exact-match --abbrev=0 --tags`

PREVIOUS_TAG=`git describe HEAD^1 --abbrev=0 --tags --always`
GIT_HISTORY=`git log --no-merges --format="- %s" $PREVIOUS_TAG..HEAD`

if [ "$PREVIOUS_TAG" == "" ]; then
  GIT_HISTORY=`git log --no-merges --format="- %s"`
fi

APP=$(echo $CURRENT_TAG | cut -d'/' -f1)
CHANNEL=$(echo $CURRENT_TAG | cut -d'/' -f2)

yecho "### Deploying $APP to $CHANNEL ###"

yecho "Current Tag: $CURRENT_TAG"
yecho "Previous Tag: $PREVIOUS_TAG"
yecho "Release Notes:
$GIT_HISTORY"

yecho "### Configuring aws tool ###"
aws configure set default.aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set default.aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region us-east-1

yecho "### Updating ECS ###"

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
        { "name": "TRACER_APP_KEY", "value": "'"$PROD_TRACER_APP_KEY"'" },
        { "name": "SECRET", "value": "'"$PROD_SECRET"'" }
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

yecho "### Deploying Image to ECS ###"
deploy_image

yecho "### Updating Cluster on ECS ###"
deploy_cluster
