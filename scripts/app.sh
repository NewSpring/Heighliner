#!/usr/bin/env sh


if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "This is a pull request. No deployment will be done."
  exit 0
fi

# if [[ "$TRAVIS_BRANCH" != "master" ]]; then
#   echo "Testing on a branch other than master. No deployment will be done."
#   exit 0
# fi

if [[ $TRAVIS_TAG == "" ]]; then
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

if [[ $PREVIOUS_TAG == "" ]]; then
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
aws --version
aws configure set default.aws_access_key_id $AWS_ACCESS_KEY
aws configure set default.aws_secret_access_key $`AWS_SECRET_ACCESS_KEY`
aws configure set default.region us-east-1

yecho "### Updating ECS ###"
source ./deploy.sh
