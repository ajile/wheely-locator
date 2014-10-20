var Services = Services || {};
Services.UserService = {

    /** @member {String} Название инициалайзера */
    name: 'user',

    /**
     * @method
     * @param {Ember.Container}     container   - Хранилище данных.
     * @param {Ember.Application}   application - Приложение.
     * @todo: Зарефакторить код (заиспользовать UserAdapter)
     */
    initialize: function(container, application) {

        Ember.Logger.debug("Initializer: Создаем понятие пользователя.");

        // Получить хранилище данных
        var store = container.lookup('store:main'),

            // Объект пользователя
            user = null,

            model = store.modelFor('user'),

            key = model.getKey(),

            // Смотрим в куках
            rawSerializedData = $.cookie(key);


        var createUser = function(data) {
            data = data || {};
            user = store.createRecord('user', data);
            user.save();
            return user;
        }

        if (rawSerializedData) {
            try {
                // @todo: Жестокий костыль (нужен сериализатор) да вообще
                // инфу о точках пользователя целесообразно укладывать куда-
                // нибудь в локальное хранилище.
                var data = JSON.parse(rawSerializedData);
                delete data.points;
                user = createUser(data);
            } catch (err) {
                user = createUser();
            }
        } else {
            user = createUser();
        }

        // Регистрируем пользователя в приложении, чтобы его можно
        // было получить в дальнейших инициализаторах.
        application.register('auth:user', user, {instantiate: false});

    }
};