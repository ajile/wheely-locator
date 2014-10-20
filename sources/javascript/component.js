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

        map: null,

        markers: {},

        coordinatesChanged: function() {

            var map = this.get('map'),
                coord = new google.maps.LatLng(
                    this.get('latitude'),
                    this.get('longitude'));

          map && map.setCenter(coord);

        }.observes('latitude', 'longitude'),

        setCoords: function() {

            var map = this.get('map'),
                coords = this.get('coords'),
                markers = this.get('markers');

            coords.forEach(function(coord){
                var id = coord['id'],
                    position = new google.maps.LatLng(coord['lat'], coord['lon']);
                if (markers[id]) {
                    // Move
                    markers[id].setPosition(position);
                } else {
                    // Create
                    markers[id] = new google.maps.Marker({
                        position: position,
                        map: map,
                        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+id+'|FF0000|000000'
                    });
                }
            }, this);

            // this.set('markers', markers);

        }.observes('coords.@each.id'),

        insertMap: function() {

            var container = this.$(".map-canvas");

            var options = {
                center: new google.maps.LatLng(this.get("latitude"), this.get("longitude")),
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            };

            var map = this.get('map');

            map || this.set('map', new google.maps.Map(container[0], options));
            this.set('markers', {});

            this.setCoords();

        }.on('didInsertElement')
    });

    return GoogleMapsComponent;

}));