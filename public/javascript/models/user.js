// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил точку с запятой в конце.
/**
 * @module models/user
 */
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember', 'ember-data'], factory);
    } else {
        // Иначе пишем все в `root` который наверняка является объектом `window`.
        factory(root, root.Ember, root.DS);
    }

}(this, function(exports, Ember, DS) {

    "use strict";

    /**
     * Моделька пользователя
     * @class User
     * @memberof App
     */
    var User = exports.App.User = DS.Model.extend({

        /**
         * Имя пользователя
         * @member {Object} username
         * @memberof App.User
         */
        username: DS.attr('string'),

        /**
         * Пароль пользователя
         * @member {Object} password
         * @memberof App.User
         */
        password: DS.attr('string'),

        /**
         * Перезависываем метод сохранения.
         * @method save
         * @memberof App.User
         */
        save: function() {
            // todo: ключ для пользователя вынеси в конфиг
            var key = User.getKey(),
                payload = JSON.stringify(this);

            $.cookie(key, payload);

            // todo: Создать соотв. тип ошибки
            // throw new Error('The user model is not committable.');
        },

        /**
         * @private
         * @method
         * @memberof App.User
         */
        toStringExtension: function() {
            return [this.get('username'), this.get('password')].join(' ');
        }
    });

    /**
     * Метод возвращает ключ, под которым укладываются данные пользователя
     * в куки.
     * @static
     * @function getKey
     * @memberof App.User
     * @return {String} Ключ под данные авторизованного пользователя.
     */
    User.getKey = function() {
        return 'user-1';
    }

    return User;

}));
