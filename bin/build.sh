#!/usr/bin/env bash

os=("linux" "mac" "windows")
if ! [[ ${os[*]} =~ $(echo "\<${1}\>") ]]
then
  echo "Usage bin/build.sh [operating system] (linux, mac or windows)"
  exit 1
fi

if [[ "$1" == "mac" ]] && [[ "$OSTYPE" != "darwin"* ]];
then
  echo "Cannot build mac files when not on a macOS system!"
  exit 1
fi

RED='\033[0;31m'
NC='\033[0m'
IMAGE=""

case $1 in
  linux)
    IMAGE="electronuserland/builder"
    ;;
  windows)
    IMAGE="electronuserland/builder:wine"
    ;;
  mac)
    IMAGE="electronuserland/builder"
    ;;
esac

docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}/src:/project/src \
 -v ${PWD}/dist:/project/dist \
 -v ${PWD}/node_modules:/project/node_modules \
 -v ${PWD}/package.json:/project/package.json \
 -v ${PWD}/package-lock.json:/project/package-lock.json \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 "$IMAGE" \
 /bin/bash -c "npm run dist:$1 && echo \"Finished building package for $1 and created new executable file in directory /dist.\""
 