App.ApplicationController = Ember.Controller.extend({

});

App.LoginController = Ember.Controller.extend({

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
    processForm: function() {

        // Убираем сообщение об ошибке
        this.set("errorMessage", null);

        /**
         * @type {Function} Функция обратного вызова, в нее передается
         *                  Promise объект после попытки коннекта к серверу
         */
        var cb = $.proxy(function(promise) {
            var s = $.proxy(this._onSuccess, this),
                f = $.proxy(this._onError, this);
            promise.then(s, f);
        }, this);

        // Посылаем событие "наверх", где должен происходить коннект
        this.send('login', this.get('username'), this.get('password'), cb);

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