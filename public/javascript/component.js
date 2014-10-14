App.GoogleMapsComponent = Ember.Component.extend({

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

        console.log(markers);

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
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.set('map', new google.maps.Map(container[0], options));

        this.setMarkers();

    }.on('didInsertElement')
});