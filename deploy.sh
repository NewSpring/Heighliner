#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"

deploy_image() {

  $(aws ecr get-login --region us-east-1)
  docker tag heighliner:latest 145764974711.dkr.ecr.us-east-1.amazonaws.com/heighliner:$CIRCLE_SHA1
  docker push 145764974711.dkr.ecr.us-east-1.amazonaws.com/heighliner:$CIRCLE_SHA1 | cat # workaround progress weirdness

}

# reads $CIRCLE_SHA1, $host_port
# sets $task_def
make_task_def() {

  task_template='[
    {
      "name": "heighliner",
      "memory": 512,
      "cpu": 1024,
      "essential": true,
      "image": "145764974711.dkr.ecr.us-east-1.amazonaws.com/heighliner:%s",
      "portMappings": [
        {
          "hostPort": 8888,
          "containerPort": 80,
          "protocol": "tcp"
        }
      ]
    }
  ]'

  task_def=$(printf "$task_template" $CIRCLE_SHA1 $host_port)
  echo task_def
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
  for attempt in {1..30}; do
      if stale=$(aws ecs describe-services --cluster apollos --services heighliner | \
                     $JQ ".services[0].deployments | .[] | select(.taskDefinition != \"$revision\") | .taskDefinition"); then
          echo "Waiting for stale deployments:"
          echo "$stale"
          sleep 5
      else
          echo "Deployed!"
          return 0
      fi
  done
  echo "Service update took too long."
  return 1
}

deploy_image
deploy_cluster
