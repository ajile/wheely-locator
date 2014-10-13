module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 3000,
                    base: './'
                }
            }
        },

        jsdoc : {
            dist : {
                src: ['public/*.js', 'test/*.js'], 
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-connect');
}