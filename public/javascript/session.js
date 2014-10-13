// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил запятую в конце.
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
     * Это класс сессии. Поскольку в задании не фигурирует понятие
     * пользователя или токена - сессия будет состоять из одного флага
     * `isAuthenticated` определяющего авторизацию пользователя, а также
     * из таких свойств, как имя пользователя `username` и пароля
     * `password`, необходимых нам, чтобы поднять соединение с сервером
     * в случае обрыва, в соотв. с установкой флага авторизованности
     * `isAuthenticated`.
     * @class Session
     */
    var Session = exports.App.Session = Ember.Object.extend(Ember.Evented, {

        /** @member {Boolean} Флаг авторизованности */
        isAuthenticated: false,

        /**
         * @deprecated
         * @member {String} Свойства пользователя (для чтения)
         */
        username: Ember.computed.alias('user.username').readOnly(),
        password: Ember.computed.alias('user.password').readOnly(),

        /** @member {DS.Model} Моделька пользователя */
        user: null,

        /**
         * @method
         * @param {Add.User}     user   - Моделька пользователя.
         */
        setUser: function(user) {

            // Проверяем
            if(!user instanceof exports.App.User) {
                throw new Error("Given arg is not a User Model");
            }

            this.user = user;

            Ember.Logger.debug("Session: Задан пользователь:", user);

            // Для цепочки
            return this;
        },

        /**
         * @constructor
         */
        init: function() {

            // На всякий случай...
            this._super();

            // Заполнить объект значениями из хранилища или сессии.
            // this._fillout();

            this.on('furnish', function() {
                Ember.Logger.debug("Session: Сессия обладает необходимыми данными для подключения.");
            });

        },

        /**
         * Метод авторизации.
         * @method
         * @param {String}     username   - Имя пользователя.
         * @param {String}     password   - Пароль пользователя.
         * @return {Session}
         */
        authenticate: function(username, password) {

            Ember.Logger.debug("Session: Авторизуем пользователя.");

            // Помечаем пользователя, как авторизованного
            this.set('isAuthenticated', true);

            // Записываем реквизиты доступа в свойства пользователя
            this.get('user').setProperties({
                username: username,
                password: password
            });

            this.get('user').save();

            // Для цепочки
            return this;
        },

        /**
         * Функция проверяет заполненость объекта пользователя данными
         * необходимыми для подключения.
         * @method
         * @return {Promise}
         */
        ready: function() {
            return new Promise($.proxy(function(resolve, reject) {
                // Если есть имя пользователя `username` и пароль `password`...
                var user = this.get('user'),
                    keys = ['username', 'password'],
                    props = user.getProperties(keys),
                    furnish = _.all(props);
                furnish ? resolve(this) : reject(this);
            }, this));
        },

        /**
         * Слушатель значений ключевых полей.
         * @method
         */
        valueObserver: _.throttle(function() {
            this.ready().then($.proxy(this.trigger, this, 'furnish'));
        }, 10, {leading: false}).observes('username', 'password')

    });

    return Session;

}));