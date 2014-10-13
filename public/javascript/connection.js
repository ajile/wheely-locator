// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил точку с запятой в конце.
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember', 'underscore'], factory);
    } else {
        // Иначе пишем все в `root` который наверняка является объектом `window`.
        factory(root, root.Ember, root._);
    }

}(this, function(exports, Ember, _) {

    "use strict";

    /**
     * Класс соединения.
     * @class ConnectionProxy
     * @namespace App
     */
    var ConnectionProxy = exports.App.ConnectionProxy = Ember.Object.extend({

        /**
         * @todo: Вытащить в отдельный конфиг
         * @member {App.ConnectionProxy} Урл WebSocket сервиса
         */
        socketURL: 'ws://mini-mdt.wheely.com',

        /** @member {?WebSocket} Объект сокета */
        socket: null,

        /**
         * Установка соединения через WebSocket с сервером.
         * @method
         * @param {String}     username   - Имя пользователя.
         * @param {String}     password   - Пароль пользователя.
         * @return {Promise}
         */
        connect: function(username, password) {

            /** @type {Object} Параметры строки запросов */
            var data = {username: username, password: password},

                /** @type {String} Строка параметров */
                params = Ember.$.param(data),

                /** @type {String} Собранный урл */
                url = [this.get('socketURL'), '?', params].join('');

            return new Promise(Ember.$.proxy(function(resolve, reject) {
                Ember.Logger.debug("%cConnectionProxy: Устанавливаем соединение по WebSocket... "+url+"", 'font-weight:900;');

                this.socket = new WebSocket(url);

                this.socket.onopen = _.partial(Ember.$.proxy(this.onOpen, this), resolve);
                this.socket.onerror = _.partial(Ember.$.proxy(this.onError, reject), reject);

                this.socket.onmessage = Ember.$.proxy(this.onMessage, this);
                this.socket.onclose = Ember.$.proxy(this.onClose, this);

            }, this));
        },

        /**
         * Закрывает соединение с сервером.
         * @method
         * @return {Promise}
         */
        disconnect: function() {
            return new Promise(Ember.$.proxy(function(resolve, reject) {
                if (this.socket instanceof WebSocket &&
                    this.socket.readyState === WebSocket.OPEN) {
                    this.socket.close();
                    resolve();
                }
            }, this));
        },

        /**
         * Соединение прошло успешно.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onOpen: function(cb) {

            Ember.Logger.debug("ConnectionProxy: Событие onOpen: ", args);

            /** @type {Array} Список аргументов, за исключением первого */
            var args = Array.prototype.slice.call(arguments, 1);

            // Вызываем callback
            cb.call(this, args);
        },

        /**
         * Соединение прошло с ошибкой.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onError: function(cb) {

            Ember.Logger.error("ConnectionProxy: Событие onError: ", args);

            /** @type {Array} Список аргументов, за исключением первого */
            var args = Array.prototype.slice.call(arguments, 1);

            // Вызываем callback
            cb.call(this, args);
        },

        /**
         * Хендлер сообщений.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onMessage: function() {
            Ember.Logger.debug("ConnectionProxy: Событие onMessage: ", arguments);
        },

        /**
         * Хендлер события onClose.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onClose: function() {
            Ember.Logger.debug("ConnectionProxy: Событие onClose: ", arguments);
        }
    });

    return ConnectionProxy;

}));