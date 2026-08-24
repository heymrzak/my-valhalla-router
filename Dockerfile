FROM ghcr.io/gis-ops/docker-valhalla/valhalla:latest

# Force root permissions so apt-get doesn't throw a permission error
USER root

# Install node runtime environments natively inside the image wrapper
RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8002
CMD ["npm", "start"]
