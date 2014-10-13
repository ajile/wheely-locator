/**
 *
 *
 * @todo: Может быть имеет смысл использовать Modernizr. Изучить.
 *
 *
 */

// http://caniuse.com/#feat=geolocation
function supports_geolocation() {
    return 'geolocation' in navigator;
}

// http://caniuse.com/#feat=websockets
function supports_websocket() {
    return 'WebSocket' in window;
}
