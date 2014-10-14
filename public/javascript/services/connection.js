var Services = Services || {};
Services.ConnectionService = {

    /** @member {String} Название инициалайзера */
    name: 'connection',

    /** @member {String} Выполнить после создания объекта сессии */
    after: 'session',

    /**
     * @method
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
};