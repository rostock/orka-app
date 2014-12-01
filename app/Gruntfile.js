module.exports = function(grunt) {
  var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        // When using AngularJS you have to disable the mangle option.
        mangle: false
      },
      // TODO add orka
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: [ 'Gruntfile.js', 'anol/modules/**/*.js', 'orka/modules/**/*.js' ],
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
      anolDev: {
        src: [
          'anol/modules/**/*.js',
        ],
        dest: 'build/<%= pkg.name %>.js'
      },
      anolDist: {
        src: [
          'anol/libs/jquery/jquery-2.1.1.min.js',
          'anol/libs/angular/angular.min.js',
          'anol/libs/ol3/ol3.min.js',
          'anol/modules/**/*.js',
          '!anol/**/angular-mocks.js',
          '!anol/test/**/*.*',
          '!anol/**/*-debug.js'
        ],
        dest: 'build/<%= pkg.name %>.js'
      },
      orkaDev: {
        src: [
          'orka/modules/**/*.js',
        ],
        dest: 'build/orka.js'
      },
      orkaDist: {
        src: [
          'orka/libs/**/*.js',
          'orka/modules/**/*.js',
          '!orka/**/angular-mocks.js',
          '!orka/test/**/*.*',
          '!orka/**/*-debug.js'
        ],
        dest: 'build/orka.js'
      }
    },
    clean: {
      temp: {
        src: [ 'build' ]
      }
    },
    configureRewriteRules: {
      options: {
          rulesProvider: 'connect.rules'
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 7000,
          middleware: function (connect, options) {
            var middlewares = [];

            // RewriteRules support
            middlewares.push(rewriteRulesSnippet);

            if (!Array.isArray(options.base)) {
              options.base = [options.base];
            }

            var directory = options.directory || options.base[options.base.length - 1];
            options.base.forEach(function (base) {
              // Serve static files.
              middlewares.push(connect.static(base));
            });

            // Make directory browse-able.
            middlewares.push(connect.directory(directory));

            return middlewares;
          }
        }
      },
      rules: [{
        from: '^/(.*)/anol/(.*)$',
        to: '/anol/$2'
      }, {
        from: '^/(.*)/orka/(.*)$',
        to: '/orka/$2'
      }, {
        from: '^/(.*)/static/(.*)$',
        to: '/static/$2'
      }, {
        from: '^/(.*)/build/(.*)$',
        to: '/build/$2'
      }, {
        from: '^/(.*)/config.js$',
        to: '/config.js'
      }, {
        from: '^(.*)/$',
        to: '/'
      }]
    },
    watch: {
      scripts: {
        files: ['anol/modules/**/*.js', 'orka/modules/**/*.js'],
        tasks: ['clean', 'concat:anolDev', 'concat:orkaDev'],
        options: {
          spawn: false,
        },
      },
    },
    html2js: {
      main: {
        src: ['anol/**/templates/*.html', 'orka/**/templates/*.html'],
        dest: 'build/templates.js'
      },
    },
    karma: {
        unit: {
          configFile: 'anol/karma.conf.js',
        }
    },
    jsdoc: {
      src: ['anol/modules/**/*.js'],
      options: {
        destination: 'doc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-rewrite');
  grunt.loadNpmTasks('grunt-common-html2js');

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('dev', ['html2js', 'concat:anolDev', 'concat:orkaDev', 'configureRewriteRules', 'connect:server', 'watch:scripts']);
  grunt.registerTask('build', ['jshint', 'concat:anolDist', 'concat:orkaDist', 'uglify', 'jsdoc']);
  grunt.registerTask('default', ['jshint', 'concat']);
  grunt.registerTask('test', ['karma:unit']);

};