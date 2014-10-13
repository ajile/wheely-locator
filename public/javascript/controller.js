App.ApplicationController = Ember.Controller.extend({

});

App.LoginController = Ember.Controller.extend({

    /** @member {Boolean} Пользователь авторизован ли? */
    isAuthenticated: Ember.computed.alias('session.isAuthenticated'),

    /** @member {App.ConnectionAdapter} Объект отвечающий на соединение */
    connection: Ember.computed.alias('connection'),

    /**
     * Перезаписан стандартный метод reset инструкцией по очистке значений
     * в форме, созданной ранее.
     *
     * @method reset
     * @todo: Заполнять поля при ресете значениями из сессии
     */
    reset: function() {
        this.setProperties({
            username: null,
            password: null,
            errorMessage: null
        });
    },

    /**
     * Экран авторизации.
     *
     * @method login
     */
    login: function() {

        // Убираем сообщение об ошибке
        this.set("errorMessage", null);

        // Получаем коннектор
        var connection = this.get('connection');

        // Коннектимся с данными username и password
        var p = connection.connect(this.get('username'), this.get('password'));

        // Обрабатываем обещание
        p.then($.proxy(this._onSuccess, this), $.proxy(this._onError, this));
    },

    /**
     * Если авторизация завершилась ошибкой
     *
     * @method login
     * @private
     */
    _onError: function() {
        this.set("errorMessage", "Неверная пара логин-пароль")
    },

    /**
     * Если авторизация прошла успешно
     *
     * @method login
     * @private
     */
    _onSuccess: function() {
        this.set("errorMessage", null)
    }

});