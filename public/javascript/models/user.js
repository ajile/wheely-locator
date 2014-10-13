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

        /**
         * Перезависываем метод сохранения.
         **/
        save: function() {
            // todo: ключ для пользователя
            var key = User.getKey(),
                payload = JSON.stringify(this);

            $.cookie(key, payload);

            // todo: Создать соотв. тип ошибки
            // throw new Error('The user model is not committable.');
        },

        toStringExtension: function() {
            return [this.get('username'), this.get('password')].join(' ');
        }
    });

    User.getKey = function() {
        return 'user-1';
    }

    var UserAdapter = exports.App.UserAdapter = DS.FixtureAdapter.extend({

        /**
         * Unfinished
         */
//        find: function(store, type, id) {
//
//            var serializer = store.serializerFor(type.typeKey);
//
//            // Ключик, под которым лежат данные пользователя
//            var key = 'user-' + parseInt(id),
//
//                // Смотрим в куках
//                rawSerializedData = $.cookie(key),
//
//                data = null;
//
//            rawSerializedData = '{"id":1,"username":"asdasd","password":"aaaa"}';
//
//            try {
//                return Promise.resolve(JSON.parse(rawSerializedData));
//            } catch (err) {
//                return Promise.reject("User by id " + id + " not found!");
//            }
//        },

    });

    // var Adapter = exports.App.UserAdapter = DS.Adapter.extend({
    //     // ...your code here
    // });

    return User;

}));
