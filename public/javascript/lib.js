function supports_geolocation() {
  return 'geolocation' in navigator;
}

function supports_websocket() {
  return 'WebSocket' in window;
}
