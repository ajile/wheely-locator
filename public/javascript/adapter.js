// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил запятую в конце.
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember'], factory);
    } else {
        // Иначе пишем все в `root` который наверняка является объектом `window`.
        factory(root, root.Ember);
    }

}(this, function(exports, Ember) {

    "use strict";

    /**
     * Создаем класс адаптера к соединению. Данный класс агрегирует в себе
     * знания о сессии и коннекторе. Способен дать команду произвести соединение
     * с сервером используя данные, что хранятся в сессии.
     * @class ConnectionProxy
     * @namespace App
     */
    var ConnectionAdapter = exports.App.ConnectionAdapter = Ember.Object.extend({

        /** @member {App.ConnectionProxy} Объект соединения */
        connector: null,

        /** @member {App.Session} Объект сессии */
        session: null,

        connect: function(username, password) {
            var c = this.get('connector');
            return new Promise(_.bind(function(resolve, reject) {
                c.connect(username, password).then(
                    _.bind(_.partial(this.onResolve,
                        username, password, resolve), this),
                    _.bind(_.partial(this.onReject,
                        reject), this)
                );
            }, this));
        },

        onResolve: function(username, password, cb) {
            this.get('session').authenticate(username, password);
            cb();
        },

        onReject: function(cb) {
            console.log(arguments);
            // this.get('session').set('isAuthenticated', false);
            cb();
        }

    })

    return ConnectionAdapter;

}));