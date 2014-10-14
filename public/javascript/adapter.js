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

    /**
     * Создаем класс адаптера к соединению. Данный класс агрегирует в себе
     * знания о сессии и коннекторе. Способен дать команду произвести соединение
     * с сервером используя данные, что хранятся в сессии.
     * @class ConnectionAdapter
     * @memberof App
     */
    var ConnectionAdapter = exports.App.ConnectionAdapter = Ember.Object.extend(Ember.Evented, {

        /** @member {App.ConnectionProxy} Объект соединения */
        connector: null,

        /** @member {App.Session} Объект сессии */
        session: null,

        /**
         * Установка соединения с сервером.
         * @method
         * @param {String}     username   - Имя пользователя.
         * @param {String}     password   - Пароль пользователя.
         * @return {Promise}
         */
        connect: function(username, password) {

            username = username || this.get('session').get('user').get('username');
            password = password || this.get('session').get('user').get('password');

            /** @type {App.ConnectionProxy} */
            var c = this.get('connector');

            this._initObservers();

            return new Promise(_.bind(function(resolve, reject) {

                // Соединение установлено
                var resolve = _.bind(this.onResolve, this,
                    username, password, resolve),

                    // Соединение прошло с ошибкой
                    reject = _.bind(this.onReject, this, reject)

                // Коннектимся
                c.connect(username, password).then(resolve, reject);

            }, this));
        },

        _initObservers: function() {

            /** @type {App.ConnectionProxy} */
            var c = this.get('connector');

            if (!c.has('close')) {
                c.on('close', function() {
                    console.log(arguments);
                });
            }

            if (!c.has('message')) {
                c.on('message', Ember.$.proxy(this.onMessage, this));
            }
        },

        /**
         * Отсоединиться от сервера.
         * @method
         * @return {Promise}
         */
        disconnect: function() {

            /** @type {App.ConnectionProxy} */
            var c = this.get('connector'),

                /** @type {Promise} */
                r = c.disconnect();

            r.then(Ember.$.proxy(function() {

                this.get('session').logout();

                this.trigger('disconnect', this);

            }, this));

            return r;
        },

        /**
         * Пришло сообщение от сокета.
         * @param {String}      username    Имя пользователя
         * @param {String}      password    Пароль пользователя
         * @param {Function}    cb          Функция обратного вызова
         * @method
         */
        onMessage: function(messageData) {
            var data = JSON.parse(messageData);
            Ember.Logger.debug("ConnectionAdapter: Событие onMessage: ", data);
            this.trigger('message', data);
        },

        /**
         * Соединение прошло успешно.
         * @param {String}      username    Имя пользователя
         * @param {String}      password    Пароль пользователя
         * @param {Function}    cb          Функция обратного вызова
         * @method
         */
        onResolve: function(username, password, cb) {
            this.get('session').authenticate(username, password);
            this.trigger('connect', this);
            cb();
        },

        /**
         * Соединение прошло с ошибкой.
         * @param {Function}    cb          Функция обратного вызова
         * @method
         */
        onReject: function(cb) {
            // this.get('session').set('isAuthenticated', false);
            cb();
        },

        sendObject: function(obj) {
            return this.get('connector').send(JSON.stringify(obj));
        }

    })

    return ConnectionAdapter;

}));