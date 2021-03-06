module.exports = function(grunt) {
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
          'build/<%= pkg.name %>.ugly.js': ['build/<%= pkg.name %>.ngmin.js']
        }
      }
    },
    jshint: {
      files: [ 'Gruntfile.js', 'src/modules/**/*.js', 'src/anol/**/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },
    ngmin: {
      dist: {
        src: [
          'src/anol/**/module.js',
          'src/anol/**/*.js',
          'src/modules/**/module.js',
          'src/modules/**/*.js',
          'src/config.js',
          'src/controller.js',
          'src/filters.js',
          'src/init.js'
        ],
        dest: 'build/<%= pkg.name %>.ngmin.js'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dev: {
        src: [
          'src/anol/**/module.js',
          'src/anol/**/*.js',
          'src/modules/**/module.js',
          'src/modules/**/*.js'
        ],
        dest: 'build/<%= pkg.name %>.js'
      },
      dist: {
        src: [
          'static/libs/jquery/jquery-3.4.1.min.js',
          'static/libs/proj4/proj4.js',
          'static/libs/proj4/proj4.defs.js',
          'static/libs/angular/angular.min.js',
          'static/libs/angular/angular.touch.min.js',
          'static/libs/angular/ui-bootstrap-tpls-0.11.2.min.js',
          'static/libs/openlayers/ol-4.6.5-custom.min.js',
          'build/<%= pkg.name %>.ugly.js',
          '!static/libs/anol/anol-templates.js'
        ],
        dest: 'build/dist/js/<%= pkg.name %>.min.js'
      }
    },
    clean: {
      prebuild: {
        src: [ 'build' ]
      },
      postbuild: {
        src: [
          'build/<%= pkg.name %>.ngmin.js',
          'build/<%= pkg.name %>.ugly.js'
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
              'static/libs/bootstrap/bootstrap.css',
              'static/libs/bootstrap/bootstrap.vertical-tabs.min.css',
              'static/libs/fontawesome/css/fontawesome.min.css',
              'static/css/ol.css',
              'static/css/style.css',
              'static/css/dynamic-style.css',
              'static/css/notab-mapstyle.css'
            ],
            dest: 'build/dist/css/'
          },
          {
            flatten:true,
            expand: true,
            src: [
              'static/css/fonts/*',
              'static/libs/bootstrap/fonts/*',
              'static/libs/fontawesome/css/fonts/*'
            ],
            dest: 'build/dist/css/fonts/'
          },
          {
            flatten: true,
            expand: true,
            src: ['static/img/highlightMarker.png'],
            dest: 'build/dist/img/'
          },
          {
            flatten: true,
            expand: true,
            src: ['static/data/full_config.js', 'static/data/locations.geojson', 'static/data/track_legend_data.json', 'static/data/poi_legend_data.json'],
            dest: 'build/dist/data'
          }
        ]
      }
    },
    preprocess: {
      dev: {
        options: {
          inline: true,
          context: {
            node_env: 'develop'
          }
        },
        src: 'static/index.html',
        dest: 'index.html'
      },
      dist: {
        options: {
          inline: true,
          context: {
            node_env: 'production'
          }
        },
        src: 'static/index.html',
        dest: 'build/dist/index.html'
      },
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 7000,
          middleware: function(connect, options, middlewares) {                       
            middlewares.unshift(function(req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Custom-Header");
                res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                next();
            });
            return middlewares;
          }            
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'src/modules/**/*.js', 'src/anol/**/*.js', ],
        tasks: ['clean:prebuild', 'ngtemplates:dev', 'concat:dev'],
        options: {
          spawn: false,
        },
      },
    },
    karma: {
        unit: {
          configFile: 'config/karma.conf.js',
        }
    },
    ngdocs: {
      options: {
        dest: 'docs',
        html5Mode: false,
        startPage: '/',
        title: 'ORKaApp Documentation'
      },
      api: {
        title: 'ORKa API',
        src: ['src/modules/**/*.js', 'src/anol/**/*.js'],
      }
    },
    ngtemplates:  {
      dev: {
        options: {
          module: 'orkaApp'
        },
        src: ['src/**/templates/*.html'],
        dest: 'build/orka-templates.js'
      },
      dist: {
        options: {
          module: 'orkaApp'
        },
        src: ['src/**/templates/*.html'],
        dest: 'build/dist/js/orka-templates.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngdocs');

  grunt.registerTask('dev', ['clean:prebuild', 'ngtemplates:dev', 'concat:dev', 'preprocess:dev', 'connect:server', 'watch:scripts']);
  grunt.registerTask('build', ['clean:prebuild', 'jshint', 'ngtemplates:dist', 'ngmin:dist', 'uglify', 'concat:dist', 'clean:postbuild', 'copy', 'preprocess:dist']);
  grunt.registerTask('default', ['jshint', 'concat']);
  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('build-doc', ['clean:docs', 'ngdocs']);
};
