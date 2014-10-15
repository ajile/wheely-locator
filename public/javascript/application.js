// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// где-то нечайно пропустил точку с запятой в конце.
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember'], factory);
    } else {
        // Иначе пишем все в `root`, который наверняка является
        // объектом `window`.
        factory(root, root.Ember);
    }

}(this, function(exports, Ember) {

    "use strict";

    /**
     * @namespace App
     */
    var App = exports.App = Ember.Application.create({

        /** @member {Boolean} Отвечает за вывод основных логов переходов */
        LOG_TRANSITIONS: false,

        /** @member {Boolean} "Хочу знать все о переходах!" */
        LOG_TRANSITIONS_INTERNAL: false,

        /** @member {Boolean} "Хочу знать все об обращениях к вьюшкам!" */
        LOG_VIEW_LOOKUPS: false,

        /** @member {Boolean} Выводить логи авто-создаваемых объектов */
        LOG_ACTIVE_GENERATION: false,

        /**
         * @member {App.Session} Объект сессии
         */
        session: null,

        /**
         * @member {App.Session} Объект соединения
         */
        adapter: null,

        /**
         * @member {App.GeoLocator} Объект гео-локации
         */
        geolocator: null,

        /** @member {App.CoordsCollection} Объект содержит в себе координаты с сервера */
        coords: null,

        ready: function() {

            this._super.apply(this, arguments);

            // Начинаем слушать события от соединения, через адаптер
            this._observeAdapter();

            // Начинаем слушать события от гео-объекта
            this._observeGeolocator();
        },

        /**
         * Хендлер для события `App#adapter.event:connect` от
         * адаптера соединения
         * @method onConnect
         * @memberof App
         */
        onConnect: function() {

            this.get('geolocator').reset().start();
            
            Ember.Logger.debug("%cApp.onConnect: Присоединились", "font-weight:900;");

        },

        /**
         * Хендлер для события `App#adapter.event:disconnect` от
         * адаптера соединения
         * @method onDisconnect
         * @memberof App
         */
        onDisconnect: function() {

            this.get('geolocator').stop();
            
            Ember.Logger.debug("%cApp.onDisconnect: Отсоединились", "font-weight:900;");

        },

        /**
         * Хендлер для события `App#geolocator.event:change` от
         * адаптера соединения
         * @method onPositionChange
         * @memberof App
         */
        onPositionChange: function(geoposition, geolocator) {

            Ember.Logger.debug("%cApp: Локальные координаты", "font-weight:900;", geoposition);

            /** @type {App.ConnectionAdapter} */
            var adapter = this.get('adapter');

            var coords = {
                lat: geoposition.coords.latitude,
                lon: geoposition.coords.longitude
            };

            adapter.sendObject(coords);

        },

        /**
         * Хендлер для события `App#geolocator.event:change` от
         * адаптера соединения
         * @method onPositionServerChange
         * @memberof App
         */
        onPositionServerChange: function(data) {

            Ember.Logger.debug("%cApp: Серверные координаты", "font-weight:900;", data);

            var coords = this.get('coords');

            coords.set('content', data);

        },

        /**
         * Установка соединения через WebSocket с сервером на основании данных
         * которые размещены в объекте сессии.
         * @method connect
         * @memberof App
         * @return {Promise}
         */
        connect: function() {

            /** @type {App.ConnectionAdapter} */
            var adapter = this.get('adapter'),

                /** @type {Promise} */
                p = adapter.connect();

            this._observeAdapter();

            return p;
        },

        /**
         * Обрывание соединения с сервером.
         * @method disconnect
         * @memberof App
         * @return {Promise}
         */
        disconnect: function() {

            /** @type {App.ConnectionProxy} */
            var adapter = this.get('adapter'),

                /** @type {Promise} */
                p = adapter.disconnect();

            return p;
        },

        /**
         * Метод инициирует прослушку событий от адаптерв.
         * @method _observeAdapter
         * @private
         * @memberof App
         */
        _observeAdapter: function() {

            /** @type {App} */
            var self = this,

                /** @type {App.ConnectionAdapter} */
                adapter = this.get('adapter'),

                // Для удобства
                p = Ember.$.proxy;

            // Если мы еще не начали слушать события...
            if (!adapter.has('connect')) {
                // ...начинаем
                adapter.on('connect', p(self.onConnect, self));
            }

            // Если мы еще не начали слушать события...
            if (!adapter.has('message')) {
                // ...начинаем
                adapter.on('message', p(self.onPositionServerChange, self));
            }

            // Если мы еще не начали слушать события...
            if (!adapter.has('disconnect')) {
                // ...начинаем
                adapter.on('disconnect', p(self.onDisconnect, self));
            }
        },

        /**
         * Метод инициирует прослушку событий от объекта гео-локации.
         * @method _observeGeolocator
         * @private
         * @memberof App
         */
        _observeGeolocator: function() {

            /** @type {App} */
            var self = this,

                /** @type {App.GeoLocator} */
                geolocator = this.get('geolocator'),

                p = Ember.$.proxy;

            // Если мы еще не начали слушать события...
            if (!geolocator.has('change')) {
                // ...начинаем
                geolocator.on('change', p(self.onPositionChange, self));
            }
        }

    });

    // Аспект: Пользователь
    App.initializer(Services.UserService);

    // Аспект: Сессия
    App.initializer(Services.SessionService);

    // Аспект: Соединение по WebSocket
    App.initializer(Services.ConnectionService);

    // Аспект: Обертка под соединение
    App.initializer(Services.AdapterService);

    // Аспект: Сервис геолокации
    App.initializer(Services.GeolocatorService);

    App.initializer({

        name: 'coords_store',

        initialize: function(container, application) {

            var CoordsCollection = exports.App.CoordsCollection = Ember.ArrayProxy.extend({
                content: Ember.A(),
            });
            var coords = CoordsCollection.create();

            application.reopen({
                coords: coords
            });

            application.register('coords:main', coords, {instantiate: false});

            application.inject('controller:maps', 'coords', 'coords:main');
        }
    });

    return App;

}));
