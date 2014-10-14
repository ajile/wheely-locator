var Services = Services || {};
Services.GeolocatorService = {

    /** @member {String} Название инициалайзера */
    name: 'geolocator',

    /** @member {String} Выполнить до создания объекта соединения */
    after: 'connection-adapter',

    /**
     * @method
     * @param {Ember.Container}     container   - Хранилище данных.
     * @param {Ember.Application}   application - Приложение.
     */
    initialize: function(container, application) {

        Ember.Logger.debug("Initializer: Создаем понятие гео-локатора.");

        /** @type {App.GeoLocator} */
        var geolocator = App.GeoLocator.create({});

        // Записываем объект адаптера соединения в приложение
        application.reopen({

            /** @member {App.ConnectionAdapter} Адаптер */
            geolocator: geolocator

        });
    }
};