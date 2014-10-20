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

    // Перестраховка
    exports.App = exports.App || {};

    var routers = {};

    // Общий роутер
    exports.App.Router.map(function() {
        this.resource('index', {path: '/'});
        this.resource('login', {path: '/login'});
        this.resource('maps', {path: '/maps'});
    });

    /**
     * Примесь для роутеров расширяет функционал возможностью управления
     * сессией. Методы словаря `actions` могут быть переопределены внутри
     * контроллера, а по дефолту используются эти.
     * @mixin
     * @memberof App
     */
    var AuthMixin = routers['AuthMixin'] = Ember.Mixin.create({

        /** @member {App.ConnectionAdapter} Объект отвечающий на соединение */
        connection: Ember.computed.alias('connection'),

        /** @member {Boolean} Авторизован ли? */
        isAuthenticated: Ember.computed.alias('session.isAuthenticated'),

        /**
         * @method setupController
         * @memberof App.AuthMixin
         * @private
         */
        setupController: function() {

            this._super.apply(this, arguments);

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
             * @method login
             * @param {String}     username   - Имя пользователя.
             * @param {String}     password   - Пароль пользователя.
             * @param {Function}   cb         - Callback функция.
             */
            login: function(username, password, cb) {

                /** @type {App.ConnectionAdapter} */
                var connection = this.get('connection');

                /** @type {Promise} */
                var p = connection.connect(username, password);

                // Если авторизация прошла успешно
                p.then(Ember.$.proxy(function() {

                    // Контроллер авторизации
                    var loginController = this.controllerFor('login'),

                        // Предыдущий "экран"
                        previousTransition = loginController.get('previousTransition');

                    if (previousTransition) {
                        // Удаляем информацию о предыдущем экране
                        loginController.set('previousTransition', null);

                        // Переход...
                        previousTransition.retry();
                    } else {
                        // Если предыдущего экрана нет, перекидывает на главную
                        // страницу, откуда уже авторизованный пользователь
                        // может быть переброшен на любой другой экран.
                        loginController.transitionToRoute('index');
                    }

                }, this));

                cb(p);

                return p;
            },

            /**
             * Обработчик события `logout`. Обрывает соединение с сервером,
             * и очищает данные сессии.
             * @method
             */
            logout: function() {

                /** @type {App.ConnectionAdapter} */
                var connection = this.get('connection');

                /** @type {Promise} */
                var p = connection.disconnect();

                p.then(Ember.$.proxy(function() {

                    // Имя роутера, куда переправить пользов.
                    var routerName = this.get('loginRouterName') || 'login';

                    // Перекидываем пользователя
                    this.transitionTo(routerName)

                }, this));

                return p;

            }
        },

    });

    /**
     * Примесь для роутеров отвечает за проверку авторизации пользователя.
     * Если пользователь не авторизован, его перекидывает на страницу авторизации.
     * Роутеры отвечающие за закрытые зоны приложения должны дополняться этим объектом.
     *
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
     * @memberof App
     */
    var AuthorizedOnlyMixin = routers['AuthorizedOnlyMixin'] = Ember.Mixin.create({

        /**
         * Здесь осуществляется проверка на права доступа к соотв.
         * экранам, чьи роутеры наследуются от данного класса. Если пользователь
         * не авторизован его перекидывает на страницу `login`.
         * @method beforeModel
         */
        beforeModel: function(transition) {

            // Имя роутера куда перебросить пользователя, если он не авторизован
            var routerName = this.get('loginRouterName');

            // Если пользователь не авторизован...
            if (!this.get('isAuthenticated')) {

                // Контроллер, отвечающий за авторизацию
                var loginController = this.controllerFor('login');

                // В него и пишем попытку перехода и...
                loginController.set('previousTransition', transition);

                transition.abort();

                // ...перекидываем пользователя на экран с формой авторизации.
                this.transitionTo(routerName);
            }

            return this._super.apply(this, arguments);

        }

    });

    /**
     * Супер класс роутеров снабженный методами управления сессией. Слушается
     * события `login` и `logout`.
     * @class BaseRoute
     * @augments Ember.Route
     * @mixes App.AuthMixin
     * @memberof App
     */
    var BaseRoute = routers['BaseRoute'] = Ember.Route.extend(AuthMixin, {

        /**
         * Название роутера с формой авторизации для реверсивного
         * построения урла. В начале ищется в свойствах самого объекта
         * если его нет, используется дефолтное имя `login`. Дефолтное имя
         * роутера для авторизации возможно также вытащить куда-нибудь в
         * общий конфиг.
         * @member {String}
         * @defaultvalue
         */
        loginRouterName: 'login'

    });

    /**
     * Класс роутера отвечающий за проверку авторизации пользователя. Если
     * пользователь не авторизован его перекидывает на страницу авторизации,
     * роутер которой обозначем свойством `loginRouterName`.
     * @class AuthRoute
     * @augments App.BaseRoute
     * @mixes App.AuthorizedOnlyMixin
     * @memberof App
     */
    var AuthRoute = routers['BaseRoute'] = BaseRoute.extend(AuthorizedOnlyMixin, {});

    /**
     * Класс роутера, отвечающего за главную страницу
     * @class IndexRoute
     * @augments App.AuthRoute
     * @memberof App
     */
    var IndexRoute = routers['IndexRoute'] = AuthRoute.extend({

        beforeModel: function(transition) {

            // Проверка в родительском объекте на авторизацию польвазователя.
            this._super.apply(this, arguments);

            // Пользователь оказался авторизованным - перекидываем его на
            // страницу с картой.
            this.transitionTo('maps');
        }

    });

    /**
     * Класс роутера отвечающий за прорисовку экрана с картой.
     * @class MapsRoute
     * @augments App.AuthRoute
     * @memberof App
     */
    var MapsRoute = routers['MapsRoute'] = AuthRoute.extend({});

    /**
     * Роутер отвечающий за прорисовку экрана с формой авторизации.
     * @class LoginRoute
     * @augments App.BaseRoute
     * @memberof App
     */
    var LoginRoute = routers['LoginRoute'] = BaseRoute.extend({

        /**
         * @method setupController
         * @memberof LoginRoute
         * @private
         */
        setupController: function(controller, context) {

            this._super.apply(this, arguments);

            // Очищаем контроллер - по существу очищаем форму аутентификации.
            controller.reset();

        }

    });

    exports.App = _.extend(exports.App, routers);
    
    return routers;

}));