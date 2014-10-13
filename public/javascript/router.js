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
     * Примесь для роутеров расширяет функционал возможностью
     * управления сессией.
     *
     * @todo:
     * Решить как лучше сделать:
     * ```javascript
     * var AuthOnlyMixin = function(options) {
     *     this.beforeModel = function() {
     *         var routerName = options.loginRouterName || 'login';
     *         !exports.App.isAuthenticated() && this.transitionTo(routerName);
     *     };
     *     return this;
     * };
     * ```
     * 
     * Расширять функционал тогда можно будет так:
     * ```javascript
     * AuthOnlyMixin.call(BaseRoute.prototype, {loginRouterName: 'login'});
     * ```
     *
     * Еще можно сделать через наследование, через проверку в методе beforeModel
     * по типу:
     * ```javascript
     * if (!this.controllerFor('login').get('session'))
     * ```
     *
     * @mixin
     */
    var LogoutMixin = App.LogoutMixin = Ember.Mixin.create({

        /** @member {App.ConnectionAdapter} Объект отвечающий на соединение */
        connection: Ember.computed.alias('connection'),

        actions: {
            logout: function() {
                this.get('connection').disconnect();
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
    var AuthOnlyMixin = App.AuthOnlyMixin = Ember.Mixin.create({

        /** @member {Boolean} Авторизован ли? */
        isAuthenticated: Ember.computed.alias('session.isAuthenticated'),

        /**
         * Здесь осуществляется проверка на права доступа к соотв.
         * экранам, чьи роутеры наследуются от данного класса. Если пользователь
         * не авторизован его перекидывает на страницу `login`.
         * @method beforeModel
         */
        beforeModel: function() {

            /**
             * Название роутера с формой авторизации для реверсивного
             * построения урла. В начале ищется в свойствах самого объекта
             * если его нет, используется дефолтное имя `login`. Дефолтное имя
             * роутера для авторизации возможно также вытащить куда-нибудь в
             * общий конфиг.
             * @type {String}
             */
            var routerName = this.get('loginRouterName') || 'login';

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
    var BaseRoute = exports.App.BaseRoute = Ember.Route.extend(LogoutMixin, {});

    // Класс роутера отвечающий за проверку авторизации пользователя.
    var AuthRoute = exports.App.BaseRoute = BaseRoute.extend(AuthOnlyMixin, {});

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

        setupController: function(controller, context) {

            // Очищаем контроллер - по существу очищаем форму аутентификации.
            controller.reset();

        }

    });

}));