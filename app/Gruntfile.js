module.exports = function(grunt) {
  var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        // When using AngularJS you have to disable the mangle option.
        mangle: true
      },
      build: {
        files: {
          'build/anol.ugly.js': ['build/anol.ngmin.js'],
          'build/orka.ugly.js': ['build/orka.ngmin.js']
        }
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
    ngmin: {
      anolDist: {
        src: [
          'anol/modules/module.js',
          'anol/modules/**/module.js',
          'anol/modules/**/*.js',
          '!anol/**/angular-mocks.js',
          '!anol/test/**/*.*',
          '!anol/**/*-debug.js'
        ],
        dest: 'build/anol.ngmin.js'
      },
      orkaDist: {
        src: [
          'orka/modules/**/module.js',
          'orka/modules/**/*.js',
          '!orka/**/angular-mocks.js',
          '!orka/test/**/*.*',
          '!orka/**/*-debug.js',
          'orka/config.js',
          'orka/controller.js',
          'orka/init.js'
        ],
        dest: 'build/orka.ngmin.js'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      anolDev: {
        src: [
          'anol/modules/module.js',
          'anol/modules/**/module.js',
          'anol/modules/**/*.js'
        ],
        dest: 'build/<%= pkg.name %>.js'
      },
      anolDist: {
        src: [
          'anol/libs/jquery/jquery-2.1.1.min.js',
          'anol/libs/angular/angular.min.js',
          'anol/libs/ol3/ol.custom.min.js',
          'build/anol.ugly.js'
        ],
        dest: 'build/dist/js/anol.min.js'
      },
      orkaDev: {
        src: [
          'orka/modules/**/module.js',
          'orka/modules/**/*.js'
        ],
        dest: 'build/orka.js'
      },
      orkaDist: {
        src: [
          'orka/libs/**/*.js',
          'build/orka.ugly.js'
        ],
        dest: 'build/dist/js/orka.min.js'
      }
    },
    clean: {
      prebuild: {
        src: [ 'build' ]
      },
      postbuild: {
        src: [
          'build/anol.ngmin.js',
          'build/anol.ugly.js',
          'build/orka.ngmin.js',
          'build/orka.ugly.js'
        ]
      },
      docs: {
        src: [ 'docs' ]
      }
    },
    copy: {
      main: {
        files: [
          {
            flatten: true,
            expand: true,
            src: [
              'anol/libs/bootstrap/bootstrap.css',
              'anol/libs/ol3/ol3.css',
              'static/css/lib/bootstrap.vertical-tabs.min.css',
              'static/css/style.css',
              'static/css/dynamic-style.css',
              'static/css/notab-mapstyle.css'
            ],
            dest: 'build/dist/css/'
          },
          {
            flatten: true,
            expand: true,
            src: ['orka/orka-templates.js'],
            dest: 'build/dist/js/'
          },
          {
            flatten: true,
            expand: true,
            src: ['static/img/highlightMarker.png'],
            dest: 'build/dist/img/'
          }
        ]
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
        from: '^/api/(.*)$',
        to: '/docs/$1'
      }, {
        from: '^(.*)/$',
        to: '/'
      }]
    },
    watch: {
      scripts: {
        files: ['anol/modules/**/*.js', 'orka/modules/**/*.js'],
        tasks: ['clean', 'ngdocs', 'concat:anolDev', 'concat:orkaDev'],
        options: {
          spawn: false,
        },
      },
    },
    karma: {
        unit: {
          configFile: 'anol/karma.conf.js',
        }
    },
    ngdocs: {
      options: {
        dest: 'docs',
        html5Mode: false,
        startPage: '/api/',
        title: 'ORKaApp API Documentation'
      },
      anolApi: {
        title: 'AnOl API',
        src: ['anol/modules/**/*.js'],
      },
      orkaApi: {
        title: 'ORKa API',
        src: ['orka/modules/**/*.js'],
      }
    },
    ngtemplates:  {
      dev: {
        options: {
          module: 'orkaApp'
        },
        src: ['anol/**/templates/*.html', 'orka/**/templates/*.html'],
        dest: 'build/templates.js'
      },
      dist: {
        options: {
          module: 'orkaApp'
        },
        src: ['anol/**/templates/*.html', 'orka/**/templates/*.html'],
        dest: 'build/dist/js/templates.js'
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-ngmin');

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngdocs');

  grunt.registerTask('dev', ['clean:prebuild', 'ngtemplates:dev', 'concat:anolDev', 'concat:orkaDev', 'configureRewriteRules', 'connect:server', 'watch:scripts']);
  grunt.registerTask('build', ['clean:prebuild', 'jshint', 'ngtemplates:dist', 'ngmin:anolDist', 'ngmin:orkaDist', 'uglify', 'concat:anolDist', 'concat:orkaDist', 'clean:postbuild', 'copy']);
  grunt.registerTask('default', ['jshint', 'concat']);
  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('build-doc', ['clean:docs', 'ngdocs']);
};
