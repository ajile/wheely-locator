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
        factory(root, root.Ember, root.DS);
    }

}(this, function(exports, Ember, DS) {

    "use strict";

    /**
     * Моделька гео-точки
     * @class GeoPoint
     * @memberof App
     */
    var GeoPoint = exports.App.GeoPoint = DS.Model.extend({

        /**
         * Широта
         * @member {Object} latitude
         * @memberof App.GeoPoint
         */
        latitude: DS.attr('string'),

        /**
         * Долгота
         * @member {Object} longitude
         * @memberof App.GeoPoint
         */
        longitude: DS.attr('string'),

        // @todo: Здесь должно быть что-то типа, но Ember текущей версии не
        // поддерживается DS
        // user: DS.belongsTo('user'),

        /**
         * @private
         * @method
         * @memberof App.GeoPoint
         */
        toStringExtension: function() {
            return [this.get('latitude'), this.get('longitude')].join('x');
        }
    });

    return GeoPoint;

}));
