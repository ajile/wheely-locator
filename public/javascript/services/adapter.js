var Services = Services || {};
Services.AdapterService = {

    /** @member {String} Название инициалайзера */
    name: 'connection-adapter',

    /** @member {String} Выполнить после создания объекта соединения */
    after: 'connection',

    /**
     * @method
     * @param {Ember.Container}     container   - Хранилище данных.
     * @param {Ember.Application}   application - Приложение.
     */
    initialize: function(container, application) {

        Ember.Logger.debug("Initializer: Создаем понятие адаптера для соединения.");

        /** @type {App.ConnectionProxy} */
        var connector = container.lookup('connection:connector'),

            /** @type {App.Session} */
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

        // Даем доступ к соединению контроллерам (в частности login),
        // через адаптер
        application.inject('route', 'connection', 'connection:adapter');

        application.inject('controller', 'connection', 'connection:adapter');
    }
};