module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['public/js/app.js', 'public/js/models/*.js', 'public/js/views/*.js', 'public/js/collections/*.js'],
        dest: 'public/js/main.js',
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat']);

};