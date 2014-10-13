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
                    base: './'
                }
            }
        },

        // Конфиги сборщика документации
        jsdoc: {
            dist: {
                src: ['public/javascript/**/*.js'], 
                options: {
                    destination: 'doc',
                    template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json",
                    encoding: "utf-8"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-connect');
}