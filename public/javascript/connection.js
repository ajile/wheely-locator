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

    // Для ручного тестирования
    // var t = 0;

    /**
     * Класс соединения.
     * @class ConnectionProxy
     * @memberof App
     */
    var ConnectionProxy = exports.App.ConnectionProxy = Ember.Object.extend(Ember.Evented, {

        /**
         * @todo: Вытащить в отдельный конфиг
         * @member {App.ConnectionProxy} Урл WebSocket сервиса
         */
        socketURL: 'ws://mini-mdt.wheely.com',

        // Для ручного тестирования
        // socketURL: 'ws://broken.com',

        /** @member {?WebSocket} Объект сокета */
        socket: null,

        isConnected: function() {
            if (this.get('socket') === null) {
                return false;
            } else {
                return this.get('socket') instanceof WebSocket &&
                       this.get('socket').readyState === WebSocket.OPEN;
            }
        }.property('socket'),

        /**
         * Установка соединения через WebSocket с сервером.
         * @method
         * @param {String}     username   - Имя пользователя.
         * @param {String}     password   - Пароль пользователя.
         * @return {Promise}
         */
        connect: function(username, password) {

            // Параметры строки запросов
            var data = {username: username, password: password},

                // Строка параметров
                params = Ember.$.param(data),

                // Собранный урл
                url = [this.get('socketURL'), '?', params].join('');

            return new Promise(Ember.$.proxy(function(resolve, reject) {

                Ember.Logger.debug("%cConnectionProxy: Устанавливаем соединение по WebSocket... "+url+"", 'font-weight:900;');

                this.socket = new WebSocket(url);

                this.socket.onopen = _.partial(Ember.$.proxy(this.onOpen, this), resolve);
                this.socket.onerror = _.partial(Ember.$.proxy(this.onError, this), reject);

                this.socket.onmessage = Ember.$.proxy(this.onMessage, this);
                this.socket.onclose = Ember.$.proxy(this.onClose, this);

                // Для ручного тестирования
                // t++;
                // if (t == 3)
                // this.set('socketURL', 'ws://mini-mdt.wheely.com');

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

        send: function(message) {
            if (this.get('socket').readyState !== WebSocket.OPEN) {
                throw new Error("Websocket is closed");
            }
            this.get('socket').send(message);
        },

        /**
         * Соединение прошло успешно.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onOpen: function(cb) {

            Ember.Logger.debug("ConnectionProxy: Событие onOpen: ", args);

            // Список аргументов, за исключением первого
            var args = Array.prototype.slice.call(arguments, 1);

            // Вызываем callback
            cb.apply(this, args);

            this.trigger('open');
        },

        /**
         * Соединение прошло с ошибкой.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onError: function(cb) {

            Ember.Logger.error("ConnectionProxy: Событие onError: ", args);

            // Список аргументов, за исключением первого
            var args = Array.prototype.slice.call(arguments, 1);

            // Вызываем callback
            cb.apply(this, args);

            this.trigger('error');
        },

        /**
         * Хендлер сообщений.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         * @private
         */        
        onMessage: function(message) {
            // Ember.Logger.debug("ConnectionProxy: Событие onMessage: ", arguments);
            this.trigger('message', message.data, this);
        },

        /**
         * Хендлер события onClose.
         * @param {CloseEvent}    closeEvent
         * @method
         * @private
         */        
        onClose: function(closeEvent) {
            Ember.Logger.debug("ConnectionProxy: Событие onClose: ", closeEvent);
            this.trigger('close', closeEvent);
        }
    });

    return ConnectionProxy;

}));