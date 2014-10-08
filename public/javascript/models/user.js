// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил запятую в конце.
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

    // Моделька пользователя
    var User = exports.App.User = DS.Model.extend({

        /** @member {Object} Имя пользователя */
        username: DS.attr('string'),

        /** @member {Object} Пароль пользователя */
        password: DS.attr('string'),

        isDirty: function() {
            return false;
        }.property(),
        save: function() {
            // todo: Создать соотв. тип ошибки
            throw new Error('The user model is not committable.');
        },
        toStringExtension: function() {
            return [this.get('username'), this.get('password')].join(' ');
        }
    });

    return User;

}));
