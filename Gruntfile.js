module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*\n<%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n<%= pkg.description %>\nLovingly coded by <%= pkg.author.name %>  - <%= pkg.author.url %> \n*/\n',
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: false,
                preserveComments: false
            },
            dist: {
                files: {
                    'public/js/<%= pkg.name %>.js': ['public/js/main.js']
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            uglify: {
                files: ['public/js/main.js', 'public/js/lib/*.js'],
                tasks: ['uglify:dist']
            },
            php: {
                files: '**/*.html',
            }
        },
        modernizr: {
            dist: {
                "devFile" : "remote",
                "outputFile" : "public/js/lib/modernizr.js",
                "files": {
                    "src": ['public/js/bower_components/*']
                }
            }
        },
        copy: {
            bower: {
                files: [{
                    expand: true,
                    flatten: true,
                    dot: true,
                    dest: 'public/css',
                    src: [
                        'public/js/bower_components/bootstrap/less/*'
                    ]
                }]
            }
        },
        rename: {
            bootstrap: {
                src: 'public/css/bootstrap.less',
                dest: 'public/css/styles.less'
            }
        }, 
        "http-server": { 
            'dev': {
    
                // the server root directory 
                root: './',
    
                // the server port 
                // can also be written as a function, e.g. 
                // port: function() { return 8282; } 
                port: 8080,
    
                // the host ip address 
                // If specified to, for example, "127.0.0.1" the server will 
                // only be available on that ip. 
                // Specify "0.0.0.0" to be available everywhere 
                host: "0.0.0.0",
    
                cache: 0,
                showDir : true,
                autoIndex: true,
    
                // server default file extension 
                ext: "html",
    
                // run in parallel with other tasks 
                runInBackground: true|false,
    
                // specify a logger function. By default the requests are 
                // sent to stdout. 
                logFn: function(req, res, error) { },    
    
                // Tell grunt task to open the browser 
                openBrowser : false,
    
            }    
        }
    });

    grunt.registerTask('build', [   
        'uglify:dist'
    ]);

    grunt.registerTask('server', [
        'uglify:dist',
        'http-server',
        'watch'
    ]);

    grunt.registerTask('init', [
        'uglify:dist',
        'modernizr',
        'copy:bower',
        'rename:bootstrap'
    ]);

    grunt.registerTask('default', 'build');
    grunt.loadNpmTasks('grunt-http-server');
}
