// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил точку с запятой в конце.
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember'], factory);
    } else {
        // Иначе пишем все в `root` который наверняка является объектом `window`.
        factory(root, root.Ember);
    }

}(this, function(exports, Ember) {

    "use strict";

    // Перестраховка
    exports.App = exports.App || {};

    /**
     * Компонент "карта" (от Google Maps).
     * @class GoogleMapsComponent
     * @memberof App
     */
    var GoogleMapsComponent = exports.App.GoogleMapsComponent = Ember.Component.extend({

        coordinatesChanged: function() {

            var map = this.get('map'),
                coord = new google.maps.LatLng(
                    this.get('latitude'),
                    this.get('longitude'));

          map && map.setCenter(coord);

        }.observes('latitude', 'longitude'),

        setMarkers: function() {
            var map = this.get('map'),
                markers = this.get('markers');

            markers.forEach(function(marker){
                new google.maps.Marker({
                    position: new google.maps.LatLng(marker.get('latitude'), marker.get('longitude')),
                    map: map
                });
            }, this);
        }.observes('markers.@each.latitude', 'markers.@each.longitude'),

        insertMap: function() {
            var container = this.$(".map-canvas");

            var options = {
                center: new google.maps.LatLng(this.get("latitude"), this.get("longitude")),
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            };

            this.set('map', new google.maps.Map(container[0], options));

            this.setMarkers();

        }.on('didInsertElement')
    });

    return GoogleMapsComponent;

}));