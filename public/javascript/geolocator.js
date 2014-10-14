// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил точку с запятой в конце.
/**
 * @module models/user
 */
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember', 'ember-data'], factory);
    } else {
        // Иначе пишем все в `root` который наверняка является объектом `window`.
        factory(root, root.Ember);
    }

}(this, function(exports, Ember) {

    "use strict";

    /**
     * Класс геолокации
     * @class GeoLocator
     * @memberof App
     */
    var GeoLocator = exports.App.GeoLocator = Ember.Object.extend(Ember.Evented, {

        timerID: null,

        position: null,

        positionPrev: null,

        init: function() {
            this.on('position', function() {
                console.log(arguments);
            });
        },

        hash: function(position) {
            var coords = position.coords,
                hash = [coords.latitude, coords.longitude].join('');

            // hash = position.timestamp;

            return hash;
        },

        positionChange: function(val) {
            var newPosition = val.position;
            var newHash = this.hash(newPosition);

            var oldPosition = this.get('positionPrev');
            var oldHash = oldPosition ? this.hash(oldPosition) : null;

            // console.log(oldHash, newHash);

            if (oldHash !== newHash) {
                this.set('positionPrev', newPosition);
                this.trigger('change', newPosition, this);
            }

        }.observes('position'),

        getPosition: function() {

            var fn = Ember.$.proxy(function() {
                this.timerID = setTimeout(Ember.$.proxy(this.getPosition, this), 1000);
            }, this);

            var success = Ember.$.proxy(function(geoposition) {
                // this.trigger('position', geoposition, this);
                this.set('position', geoposition);
                fn();
            }, this);

            var failure = Ember.$.proxy(function() {
                fn();
            }, this);

            if (geoPosition.init()) {
                geoPosition.getCurrentPosition(success, failure, {enableHighAccuracy:true});
            }

        },

        start: function() {

            Ember.Logger.debug("GeoLocator: Начинаем периодически проверять позицию.");

            clearInterval(this.timerID);

            this.getPosition();

            this.trigger('start', this);
            return this;
        },

        stop: function() {
            Ember.Logger.debug("GeoLocator: Останавливаем проверки.");
            clearInterval(this.timerID);
            this.trigger('stop', this);
            return this;
        },

        reset: function() {
            Ember.Logger.debug("GeoLocator: Обнуляем позицию.");
            this.set('positionPrev', null);
            this.trigger('reset', this);
            return this;
        },

    });

    return GeoLocator;

}));
