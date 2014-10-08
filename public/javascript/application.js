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

    // Наше приложение
    var App = exports.App = Ember.Application.create({

        /** @member {Boolean} Отвечает за вывод основных логов переходов */
        LOG_TRANSITIONS: false,

        /** @member {Boolean} "Хочу знать все о переходах!" */
        LOG_TRANSITIONS_INTERNAL: false,

        /**
         * @member {App.Session} Объект сессии
         */
        session: null,

        /**
         * @member {App.ConnectionProxy} Объект соединения
         */
        connector: null,

        /**
         * Установка соединения через WebSocket с сервером на основании данных
         * которые размещены в объекте сессии.
         * @method
         * @deprecated Структура приложения была переосмыслена, этот блок нужно
         *             удалить. Смотри инифиализатор "connection-adapter".
         * @todo: Вернуть обещание, которое далее обработать в контроллере
         *        логина
         * @return {Promise}
         */
        connect: function() {

            /** @type {App.ConnectionProxy} */
            var connector = this.get('connector'),
                s = this.get('session');

            return connector.connect(s.get('username'), s.get('password'));
        },

        disconnect: function() {

        }

    });


    App.initializer({

        /** @member {String} Название инициалайзера */
        name: 'user',

        /**
         * @constructor
         * @param {Ember.Container}     container   - Хранилище данных.
         * @param {Ember.Application}   application - Приложение.
         */
        initialize: function(container, application) {

            Ember.Logger.debug("Initializer: Создаем понятие пользователя.");

            // Получить хранилище данных
            var store = container.lookup('store:main'),

                // Создаем пустой объект пользователя, который будет
                // использован для хранения сессионных данных.
                user = store.createRecord('user');

                user.set("username", "alen_a_arenson");
                user.set("password", "alen_a_arenson");

            // Регистрируем пользователя в приложении, чтобы его можно
            // было получить в дальнейших инициализаторах.
            application.register('auth:user', user, {instantiate: false});

        }
    });


    App.initializer({

        /** @member {String} Название инициалайзера */
        name: 'session',

        /** @member {String} Выполнить после инициалайзера */
        after: 'user',

        /**
         * @constructor
         * @param {Ember.Container}     container   - Хранилище данных.
         * @param {Ember.Application}   application - Приложение.
         */
        initialize: function(container, application) {

            Ember.Logger.debug("Initializer: Создаем понятие сессии.");

            // Создаем экземпляр класса
            var session = App.Session.create(),

                // Функция установки соединения с сервером по WebSocket.
                connect = $.proxy(application.connect, application),

                // Получить инстанс модельки пользователя, что используется в сессии
                user = container.lookup('auth:user');

            // Передаем объект пользователя в сессию
            session.setUser(user);

            // Записываем объект сессии в приложение
            application.reopen({

                /** @member {App.Session} Объект сессии */
                session: session

            });

            // Проверяем заполненость сессии данными
            // session.ready().then(connect);

            // Здесь можно подписаться на событие заполнености сессии
            // session.on('furnish', connect);

            // Регистрируем объект сессии в App с именем session:main.
            application.register('session:main', session, {instantiate: false});

            // Поскольку сессия является аспектом приложения, знаниям о ней
            // необходимо снабдить определенные слои, такие как контроллер и
            // роутер. В серверных приложениях, как правило сессия находится в
            // запросе.

            // В понятие контроллера вставляем знания о session.
            // Таким образом экземпляр класса Session становится доступен по
            // ключу `session` из любого контроллера этого приложения. Далее он 
            // может быть использован для проверки авторизации пользователя или
            // для создания соотв. свойства контроллера для проверки
            // авторизации внутри используемых шаблонов.
            application.inject('controller', 'session', 'session:main');

            // В понятие роутера также вставляем знания о session.
            // Это нужно для того чтобы роутер мог определить
            // доступность контроллера.
            application.inject('route', 'session', 'session:main');
        }
    });


    App.initializer({

        /** @member {String} Название инициалайзера */
        name: 'connection',

        /**
         * @constructor
         * @param {Ember.Container}     container   - Хранилище данных.
         * @param {Ember.Application}   application - Приложение.
         */
        initialize: function(container, application) {

            Ember.Logger.debug("Initializer: Создаем понятие соединения по WebSocket.");

            // Создаем экземпляр класса
            var connector = App.ConnectionProxy.extend({});

            // Регистрируем этот класс в App с именем connector:connector.
            application.register('connection:connector', connector, {
                singleton: true
            });
        }
    });


    App.initializer({

        /** @member {String} Название инициалайзера */
        name: 'connection-adapter',

        /** @member {String} Выполнить после создания объекта соединения */
        after: 'connection',

        /**
         * @constructor
         * @param {Ember.Container}     container   - Хранилище данных.
         * @param {Ember.Application}   application - Приложение.
         */
        initialize: function(container, application) {

            Ember.Logger.debug("Initializer: Создаем понятие адаптера для соединения.");

            var connector = container.lookup('connection:connector'),
                session = container.lookup('session:main'),

                // Дополняем объект знаниями о сессии и коннекторе.
                ConnectionAdapter = App.ConnectionAdapter.extend({

                    /** @member {App.ConnectionProxy} Объект соединения */
                    connector: connector,

                    /** @member {App.Session} Объект сессии */
                    session: session,

                });


            // Создаем экземпляр класса
            var adapter = ConnectionAdapter.create();

            // Записываем объект адаптера соединения в приложение
            application.reopen({

                /** @member {App.ConnectionAdapter} Адаптер */
                adapter: adapter

            });


            // Регистрируем этот класс в App с именем connector:adapter.
            application.register('connection:adapter', adapter, {
                instantiate: false
            });

            // Даем доступ к соединению контроллеру login, через адаптер
            application.inject('controller:login', 'connection', 'connection:adapter');
        }
    });

    return App;

}));
