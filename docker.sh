#!/bin/bash -e
# This file is used to build the Docker image
# Examples:
#./docker.sh
#./docker.sh arm64v8

# To test the docker image a command like this can be used:
#docker run --rm -p 3123:3000 --name iconizza-api -v $(realpath "../iconizza-cache"):/data/iconizza-api/cache -v $(realpath "../iconizza-config"):/data/iconizza-api/src/config iconizza/api:latest
#docker run --rm -p 3123:3000 --name iconizza-api -v /absolute/path/iconizza-cache:/data/iconizza-api/cache -v /absolute/path/iconizza-config:/data/iconizza-api/src/config iconizza/api:latest
DOCKER_REPO=iconizza/api
ICONIZZA_API_REPO=$(realpath "./")
BUILD_SOURCE=$(realpath "./")
SHARED_DIR=$BUILD_SOURCE/../shared
DOCKERFILE=$(realpath "./Dockerfile")
SRC_PATH="./"
if [ -z "$1" ]; then
    ARCH=amd64
    # ARCH=arm64v8
else
    ARCH=$1
fi
echo "Starting to build for arch: $ARCH"
echo "Build BASE dir: $BUILD_SOURCE"

export ICONIZZA_API_VERSION=$(grep -oE "\"version\": \"([0-9]+.[0-9]+.[a-z0-9.-]+)" $ICONIZZA_API_REPO/package.json | cut -d\" -f4)

echo "Iconizza API version: ${ICONIZZA_API_VERSION}"

mkdir -p $BUILD_SOURCE/tmp

# If we need a different APT package list during the build, this will fetch it
# This is useful in case a local APT cache is used.
if [ -s $SHARED_DIR/sources-build.list ]; then
    cp -f $SHARED_DIR/sources-build.list $BUILD_SOURCE/tmp/sources.list
else
    rm -f $BUILD_SOURCE/tmp/sources.list
    touch $BUILD_SOURCE/tmp/sources.list
fi

# If we need an extra CA root cert during the build, this will fetch it
# This is useful in case connections go through eg. a Squid proxy to cache npm packages.
if [ -s $SHARED_DIR/build-ca-cert.crt ]; then
    cp -f $SHARED_DIR/build-ca-cert.crt $BUILD_SOURCE/tmp/build-ca-cert.crt
else
    rm -f $BUILD_SOURCE/tmp/build-ca-cert.crt
    touch $BUILD_SOURCE/tmp/build-ca-cert.crt
fi

time docker build --rm=false \
    --build-arg ARCH=$ARCH \
    --build-arg ICONIZZA_API_VERSION=${ICONIZZA_API_VERSION} \
    --build-arg BUILD_DATE="$(date +"%Y-%m-%dT%H:%M:%SZ")" \
    --build-arg TAG_SUFFIX=default \
	--build-arg SRC_PATH="$SRC_PATH" \
    --file $DOCKERFILE \
    --tag ${DOCKER_REPO}:latest --tag ${DOCKER_REPO}:${ICONIZZA_API_VERSION} $BUILD_SOURCE

rm -fR $BUILD_SOURCE/tmp
