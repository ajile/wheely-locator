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

        /** @member {Number} Всего попыток установить соединение */
        numberOfAttempts: 5,

        /** @member {Number} Было совершено попыток */
        attempts: 0,

        /**
         * Установка соединения с сервером.
         * @method
         * @param {String}     username   - Имя пользователя.
         * @param {String}     password   - Пароль пользователя.
         * @return {Promise}
         */
        connect: function(username, password) {

            /** @type {App.ConnectionProxy} */
            var c = this.get('connector');

            // Проверять статус соединения, если соединен, возвращать выполненое
            // обещание, если соединяется - возвращать обещание, если закрыт -
            // (инструкцию, что ниже), если статус "закрывается" - нужно
            // дождаться конца и вернуть обещание на открытие.

            // Пользователя и пароль, в случае если в аргументах они не пришли
            // берем из объекта сессии.
            username = username || this.get('session').get('user').get('username');
            password = password || this.get('session').get('user').get('password');

            // Кол-во попыток установить связь с сервером было сделано...
            var attempts = this.get('attempts'),

                // ...из возможных
                numberOfAttempts = this.get('numberOfAttempts');

            var lpromise = new Ember.$.Deferred();

            var wrappedResolve = _.bind(this.onResolve, this, username, password, lpromise.resolve);
            var wrappedReject = _.bind(this.onReject, this, lpromise.reject);

            var retry = _.bind(function () {

                // Увеличиваем показатель кол-ва попыток
                attempts = this.incrementProperty('attempts');

                // Подсчитываем время, которое нужно выждать до следующей
                // попытки. Возможно увеличивать его экспоненциально по
                // следующей формуле ```Math.pow(25, attempts)```
                var timeToNextTry = attempts * 1000;

                Ember.Logger.debug("ConnectionAdapter: Попытка установить соединение #%d из %d провалена", attempts, numberOfAttempts);

                if (attempts >= numberOfAttempts) {
                    Ember.Logger.debug("ConnectionAdapter: Больше попыток нет");
                    // Если совершенных попыток соединения было больше
                    // максимально допустимых, вызываем `reject` метод
                    // обещания
                    wrappedReject();
                    return;
                }

                Ember.Logger.debug("ConnectionAdapter: Попытаемся снова через %d сек.", Math.ceil(timeToNextTry / 1000));

                return new Ember.$.Deferred(function(a, b) {
                    setTimeout(function() {
                        var n = c.connect(username, password);
                        n.then(wrappedResolve);
                        n.catch(retry);
                    }, timeToNextTry);
                }).promise();

            }, this);

            // Коннектимся
            var promise = c.connect(username, password);

            // Если успешно, вызываем метод onResolve, который авторизует
            // пользователя и записывает в сессию подошежшие данные, а также
            // функцию выполнение которой ожидает запрашивающая сторона
            promise.then(wrappedResolve);

            // Если попытка соединения была провалена, пытаемся снова...
            promise.catch(retry);

            // ииии...возвращаем чистый promise объект
            return lpromise.promise();
        },

        resetAttempts: function() {
            return this.set('attempts', 0);
        },

        _initObservers: function() {

            /** @type {App.ConnectionProxy} */
            var c = this.get('connector');

            if (!c.has('message')) {
                c.on('message', Ember.$.proxy(this.onMessage, this));
            }

            if (!c.has('error')) {
                c.on('error', Ember.$.proxy(this.onError, this));
            }

            if (!c.has('close')) {
                c.on('close', Ember.$.proxy(this.onClose, this));
            }
        },

        _removeObservers: function() {

            /** @type {App.ConnectionProxy} */
            var c = this.get('connector');

            c.has('message') && c.off('message');
            c.has('error') && c.off('error');
            c.has('close') && c.off('close');
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
         * Закрытие.
         * @method
         */
        onClose: function(closeEvent) {
            this._removeObservers();

            // Соединение было разорвано или нет причины
            if (!closeEvent.wasClean || closeEvent.code == '1005') {
                setTimeout(Ember.$.proxy(this.connect, this), 10000);
            } else {
                this.trigger('close', closeEvent, this);
            }
        },

        /**
         * Пришла ошибка.
         * @method
         */
        onError: function(errorEvent) {
            this.trigger('message', errorEvent, this);
        },

        /**
         * Пришло сообщение от сокета.
         * @method
         */
        onMessage: function(messageData) {
            var data = JSON.parse(messageData);
            // Ember.Logger.debug("ConnectionAdapter: Событие onMessage: ", data);
            this.trigger('message', data, this);
        },

        /**
         * Соединение прошло успешно.
         * @param {String}      username    Имя пользователя
         * @param {String}      password    Пароль пользователя
         * @param {Function}    cb          Функция обратного вызова
         * @method
         */
        onResolve: function(username, password, cb) {
            this._initObservers();
            this.get('session').authenticate(username, password);
            this.trigger('connect', this);
            cb();
        },

        /**
         * Соединение прошло с ошибкой.
         * @param {Function}    cb          Функция обратного вызова
         * @param {CloseEvent}  closeEvent
         * @method
         */
        onReject: function(cb, closeEvent) {
            cb();
        },

        sendObject: function(obj) {
            return this.get('connector').send(JSON.stringify(obj));
        }

    })

    return ConnectionAdapter;

}));