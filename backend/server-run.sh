#!/bin/bash

set -e

if [ ! -f .env ]; then
    echo "Creating .env file..."
    read -sp "Enter database password: " DB_PASSWORD
    echo "DB_PASSWORD=$DB_PASSWORD" > .env
    echo -e "\n.env file created"
fi

if ! docker network inspect awp-tracker-network >/dev/null 2>&1; then
    echo "Creating docker network..."
    docker network create awp-tracker-network
fi

echo "Pulling latest images..."
docker-compose pull

echo "Starting services..."
docker-compose up -d

echo "Waiting for services to be healthy..."
timeout 60 sh -c 'until docker-compose ps | grep -q "healthy"; do sleep 1; done'

echo "Deployment complete! Services are running."
echo "Check status with: docker-compose ps"
