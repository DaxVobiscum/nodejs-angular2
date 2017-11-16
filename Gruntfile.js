module.exports = function (grunt) {
    
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            public: {
                files: [
                    { './src/bin/app.bundle.js': [ './build/app/app.module.js' ] }
                ]
            }
        },
        clean: {
            release: {
                files: [
                    { contents: 'src/bin/*', force: true },
                    { contents: 'public/*' }
                ]
            },
            debug: {
                files: [
                    { contents: 'public/*' }
                ]
            }
        },
        copy: {
            release: {
                files: [
                    { expand: true, cwd: './src/', src: './index.release.html', dest: './public/', timestamp: false, 
                        rename: function (dest, src) { return dest + src.replace('.release', ''); } },
                    { expand: true, cwd: './src/', src: './assets/css/**', dest: './public/css/', timestamp: false },
                    { expand: true, cwd: './src/', src: './assets/img/**', dest: './public/img/', timestamp: false },
                    { expand: true, cwd: './src/', src: './bin/**', dest: './public/js/', timestamp: false }
                ]
            },
            debug: {
                files: [
                    { expand: true, cwd: './src/', src: './index.debug.html', dest: './public/', timestamp: false, 
                        rename: function (dest, src) { return dest + src.replace('.debug', ''); } },
                    { expand: true, cwd: './src/', src: './assets/**', dest: './public/', timestamp: false },
                    { expand: true, cwd: './src/bin/', src: './app.bundle.js*', dest: './public/app/', timestamp: false }
                ]
            }
        },
        ts: {
            debug: {
                src: [ "typings/index.d.t", "src/app/**.ts", "!node_modules/**" ],
                outDir: "./temp/",
                options: {
                    experimentalDecorators: true,
                    sourceMap: true,
                    noImplicitAny: true,
                    module: "commonjs",
                    moduleResolution: "node",
                    target: "es6"
                }
            }
        },
        uglify: {
            build: {
                files: [
                    { './src/bin/lib.min.js': [ './src/assets/libs/*.js', './src/assets/js/*.js' ] },
                    { './src/bin/app.min.js': [ './src/app/*/*.js' ] }
                ]
            }
        },
        webpack: {
            debug: {
                entry: [ './src/app/main.ts', './src/app/app.module.ts' ],
                output: {
                    path: './src/bin/',
                    filename: 'app.bundle.js'
                },
                devtool: 'source-map',
                resolve: {
                    extensions: [ '', '.ts', '.js' ]
                },
                module: {
                    loaders: [
                        { test: /\.ts$/, loader: 'ts-loader' }
                    ],
                    noParse: [ 'node_modules' ]
                },
                ts: {
                    compilerOptions: {
                        experimentalDecorators: true,
                        sourceMap: true,
                        noImplicitAny: false,
                        module: "commonjs",
                        moduleResolution: "node",
                        target: "es5"
                    }
                }
            }
        },
        shell: {
            startRedis: {
                command: 
                    "redis_status=$(sudo service redis-server status) ; "
                    + "if [ \"redis-server is running\" != \"$redis_status\" ] ; then "
                        + "sudo service redis-server start ; "
                    + "else "
                        + "echo $redis_status ; "
                    + "fi",
                options: {
                    stdout: true
                }
            },
            startServer: {
                command:
                    "node server.js",
                options: {
                    stdout: true
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-webpack');
    
    // grunt.registerTask('bundle', [ 'newer:browserify' ]);
    // grunt.registerTask('uglyBundle', [ 'newer:uglify:bundle' ]);
    
    grunt.registerTask('compileTS', [ 'ts:debug' ]);
    
    grunt.registerTask('uglyBundle', [ 'uglify:build' ]);
    
    grunt.registerTask('pack', [ 'webpack:debug' ]);
    
    // grunt.registerTask('clientBundle', [ 'bundle', 'uglyBundle' ]);
    
    grunt.registerTask('buildDebug', [ 'clean:debug', 'webpack:debug', 'copy:debug' ]);
    grunt.registerTask('buildRelease', [ 'clean:release', 'copy:release' ]);
    
    // grunt.registerTask('build', [ 'bundle' ]);
    grunt.registerTask('dbConnect', [ 'shell:startRedis' ]);
    grunt.registerTask('serverStart', [ 'shell:startServer' ]);
    
    // grunt.registerTask('preStart', [ 'build', 'dbConnect' ]);
    
    // grunt.registerTask('fullStart', [ 'preStart', 'serverStart' ]);
    
    grunt.registerTask('default', [ 'dbConnect', 'buildDebug' ]);
};