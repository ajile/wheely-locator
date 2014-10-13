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

    // Перестраховка
    exports.App = exports.App || {};

    /**
     * Примесь для роутеров расширяет функционал возможностью управления
     * сессией. Методы словаря `actions` могут быть переопределены внутри
     * контроллера, а по дефолту используются эти.
     * @mixin
     */
    var AuthMixin = exports.App.AuthMixin = Ember.Mixin.create({

        /** @member {App.ConnectionAdapter} Объект отвечающий на соединение */
        connection: Ember.computed.alias('connection'),

        /** @member {Boolean} Авторизован ли? */
        isAuthenticated: Ember.computed.alias('session.isAuthenticated'),

        /**
         * @method
         */
        setupController: function() {

            this._super();

            // Дополняем контроллер знаниями об авторизованности.
            this.controller.reopen({

                /** @member {Boolean} Пользователь авторизован ли? */
                isAuthenticated: Ember.computed.alias('session.isAuthenticated'),

            });

        },

        actions: {

            /**
             * Обработчик события `login`. Устанавливает соединение с
             * сервером, с заданными `username` и `password`, ответ типа
             * promise отправляет в пришедшую функцию `cb`.
             * @method
             * @param {String}     username   - Имя пользователя.
             * @param {String}     password   - Пароль пользователя.
             * @param {Function}   cb         - Callback функция.
             */
            login: function(username, password, cb) {

                /** @type {App.ConnectionAdapter} */
                var connection = this.get('connection');

                /** @type {Promise} */
                var p = connection.connect(username, password);

                cb(p);
            },

            /**
             * Обработчик события `logout`. Обрывает соединение с сервером,
             * и очищает данные сессии.
             * @method
             */
            logout: function() {
                this.get('connection').disconnect();
                var routerName = this.get('loginRouterName') || 'login';
                this.transitionTo(routerName)
            }
        },

    });

    /**
     * Примесь для роутеров отвечает за проверку авторизации пользователя.
     * Если пользователь не авторизован, его перекидывает на страницу авторизации.
     * Роутеры отвечающие за закрытые хоны приложения должны дополняться этим объектом.
     *
     * @mixin
     */
    var AuthorizedOnlyMixin = App.AuthorizedOnlyMixin = Ember.Mixin.create({

        /**
         * Здесь осуществляется проверка на права доступа к соотв.
         * экранам, чьи роутеры наследуются от данного класса. Если пользователь
         * не авторизован его перекидывает на страницу `login`.
         * @method beforeModel
         */
        beforeModel: function() {

            var routerName = this.get('loginRouterName');

            // Если пользователь не авторизован, перекидываем его на экран
            // с формой авторизации.
            this.get('isAuthenticated') || this.transitionTo(routerName);

        }

    });

    // Общий роутер
    exports.App.Router.map(function() {
        this.resource('index', {path: '/'});
        this.resource('login', {path: '/login'});
        this.resource('maps', {path: '/maps'});
    });

    // Супер класс роутера снабженный методами управления сессией.
    var BaseRoute = exports.App.BaseRoute = Ember.Route.extend(AuthMixin, {

        /**
         * Название роутера с формой авторизации для реверсивного
         * построения урла. В начале ищется в свойствах самого объекта
         * если его нет, используется дефолтное имя `login`. Дефолтное имя
         * роутера для авторизации возможно также вытащить куда-нибудь в
         * общий конфиг.
         * @type {String}
         */
        loginRouterName: 'login'

    });

    // Класс роутера отвечающий за проверку авторизации пользователя.
    var AuthRoute = exports.App.BaseRoute = BaseRoute.extend(AuthorizedOnlyMixin, {});

    // Роутер отвечающий за прорисовку главной страницы
    var IndexRoute = exports.App.IndexRoute = AuthRoute.extend({

        beforeModel: function() {

            // Проверка в родительском объекте на авторизацию польвазователя.
            this._super();

            // Пользователь оказался авторизованным - перекидываем его на
            // страницу с картой.
            this.transitionTo('maps');
        }

    });

    // Роутер отвечающий за прорисовку экрана с картой.
    var MapsRoute = exports.App.MapsRoute = AuthRoute.extend({})

    // Роутер отвечающий за прорисовку экрана с формой авторизации.
    var LoginRoute = exports.App.LoginRoute = BaseRoute.extend({

        /**
         * @method
         */
        setupController: function(controller, context) {

            this._super();

            // Очищаем контроллер - по существу очищаем форму аутентификации.
            controller.reset();

        }

    });

}));