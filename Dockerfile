FROM ghcr.io/gis-ops/docker-valhalla/valhalla:latest

# Force the container to route traffic through Railway's assigned port proxy
CMD ["sh", "-c", "exec valhalla_service /custom_files/valhalla.json ${PORT}"]
