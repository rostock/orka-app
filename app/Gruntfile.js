module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        // When using AngularJS you have to disable the mangle option.
        mangle: false
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: [ 'Gruntfile.js', 'anol/modules/**/*.js' ],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['anol/libs/**/*.js', 'anol/modules/**/*.js'],
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    clean: {
      temp: {
        src: [ 'build' ]
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 7000
        }
      }
    },
    watch: {
      scripts: {
        files: ['anol/modules/**/*.js'],
        tasks: ['concat'],
        options: {
          spawn: false,
        },
      },
    },
    html2js: {
      main: {
        src: ['anol/**/*.tpl.html'],
        dest: 'build/templates.js'
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-common-html2js');

  grunt.registerTask('dev', ['html2js', 'concat', 'connect:server', 'watch']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('default', ['jshint', 'concat']);

};