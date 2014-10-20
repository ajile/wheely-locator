module.exports = function(grunt) {
    grunt.initConfig({

        // Читаем конфиги из файла проекта
        pkg: grunt.file.readJSON('package.json'),

        // Переносной сервер :)
        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 3000,
                    // hostname: "192.168.0.107",
                    base: './'
                }
            }
        },

        // Конфиги сборщика документации
        jsdoc: {
            dist: {
                src: ['sources/javascript/**/*.js'], 
                options: {
                    destination: 'doc',
                    template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json",
                    encoding: "utf-8"
                }
            }
        },

        // Объеденяем файлы приложения вместе
        uglify: {
            application: {
                files: {
                    'public/javascript/application.min.js': [
                        'sources/javascript/vendor/geoPosition.js',
                        'sources/javascript/lib.js',
                        'sources/javascript/services/user.js',
                        'sources/javascript/services/session.js',
                        'sources/javascript/services/connection.js',
                        'sources/javascript/services/adapter.js',
                        'sources/javascript/services/geolocator.js',
                        'sources/javascript/application.js',
                        'sources/javascript/session.js',
                        'sources/javascript/connection.js',
                        'sources/javascript/adapter.js',
                        'sources/javascript/geolocator.js',
                        'sources/javascript/router.js',
                        'sources/javascript/controller.js',
                        'sources/javascript/component.js',
                        'sources/javascript/models/geopoint.js',
                        'sources/javascript/models/user.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['uglify']);
}