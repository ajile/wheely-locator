// Точка с запятой здесь нужна, чтобы не случилось батхёрта
// у программиста, который без разбора лепит все файлы в один и
// нечайно пропустил запятую в конце.
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // Декларируем роутеры с соотв. с окружением. Начнет с AMD.
        define(['exports', 'ember', 'underscore'], factory);
    } else {
        // Иначе пишем все в `root` который наверняка является объектом `window`.
        factory(root, root.Ember, root._);
    }

}(this, function(exports, Ember, _) {

    "use strict";

    /**
     * Создаем класс соединения.
     * @class ConnectionProxy
     * @namespace App
     */
    var ConnectionProxy = exports.App.ConnectionProxy = Ember.Object.extend({

        socketURL: 'ws://mini-mdt.wheely.com',

        init: function() {
        },

        connect: function(username, password) {
            var socket = null,
                data = {username: username, password: password},
                params = Ember.$.param(data),
                url = [this.get('socketURL'), '?', params].join('');

            return new Promise($.proxy(function(resolve, reject) {
                Ember.Logger.debug("%cConnectionProxy: Устанавливаем соединение по WebSocket... "+url+"", 'font-weight:900;');

                socket = new WebSocket(url);

                socket.onopen = _.partial($.proxy(this.onOpen, this), resolve);
                socket.onerror = _.partial($.proxy(this.onError, reject), reject);

                socket.onmessage = $.proxy(this.onMessage, this);
                socket.onclose = $.proxy(this.onClose, this);

            }, this));
        },
        
        onOpen: function(cb) {
            var args = Array.prototype.slice.call(arguments, 1);
            cb.call(this, args);
            Ember.Logger.debug("ConnectionProxy: Событие onOpen: ", args);
        },
        
        onError: function(cb) {
            var args = Array.prototype.slice.call(arguments, 1);
            cb.call(this, args);
            Ember.Logger.error("ConnectionProxy: Событие onError: ", args);
        },
        
        onMessage: function() {
            Ember.Logger.debug("ConnectionProxy: Событие onMessage: ", arguments);
        },
        
        onClose: function() {
            Ember.Logger.debug("ConnectionProxy: Событие onClose: ", arguments);
        }
    });

    return ConnectionProxy;

}));