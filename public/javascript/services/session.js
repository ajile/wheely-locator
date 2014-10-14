var Services = Services || {};
Services.SessionService = {

    /** @member {String} Название инициалайзера */
    name: 'session',

    /** @member {String} Выполнить после инициалайзера */
    after: 'user',

    /**
     * @method
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

        // Тормозим инициализацию роутера, пока не получим
        // информацию об авторизованном пользователе
        App.deferReadiness();

        // Передаем объект пользователя в сессию
        session.setUser(user);

        // Записываем объект сессии в приложение
        application.reopen({

            /** @member {App.Session} Объект сессии */
            session: session

        });

        // Проверяем заполненость сессии данными
        session.ready().then(connect).then(function() {
            // Разблокируем инициализацию роутера
            App.advanceReadiness();
        }).catch(function() {
            // Разблокируем инициализацию роутера
            App.advanceReadiness();
        });

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
};