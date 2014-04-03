var exec = require('child_process').exec,
	fs = require('fs'),
	path = require('path'),
	wrench = require('wrench');

var NAME = 'ti-commonjs',
	TMP_DIR = 'tmp';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				require: ['should'],
				timeout: 3000,
				ignoreLeaks: false,
				reporter: 'spec'
			},
			src: ['test/*_test.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: [
				'Gruntfile.js',
				'lib/**/*.js',
				'test/**/*.js'
			]
		},
		titanium: {
			create: {
				options: {
					command: 'create',
					name: TMP_DIR,
					workspaceDir: '.',
					platforms: ['android','ios']
				}
			},
			build: {
				options: {
					command: 'build',
					projectDir: TMP_DIR,
					logLevel: 'info',
					//platform: 'android',
					//target: 'device'
				}
			}
		},
		alloy: {
			all: {
				options: {
					command: 'new',
					args: [TMP_DIR]
				}
			}
		},
		clean: {
			src: [TMP_DIR]
		}
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-titanium');
	grunt.loadNpmTasks('grunt-alloy');

	// load test app
	grunt.registerTask('app-prep', 'Load source files into example alloy app', function() {
		var done = this.async(),
			srcDir = path.join('test', 'app'),
			dstDir = path.join(TMP_DIR, 'app'),
			assetsDir = path.join(dstDir, 'assets'),
			tmpAssetsDir = path.join(TMP_DIR, 'assets'),
			libDir = path.join(dstDir, 'lib');

		// copy app source files
		grunt.log.write('Preparing test app at "%s"...', dstDir);
		fs.renameSync(assetsDir, tmpAssetsDir);
		wrench.copyDirSyncRecursive(srcDir, dstDir, { forceDelete: true });
		fs.renameSync(tmpAssetsDir, assetsDir);

		// do ti-commonjs install
		exec('cd "' + TMP_DIR + '" && npm install --prefix ./app/lib ..', function(err, stdout, stderr) {
			if (err) {
				return done(err);
			}

			// run npm install on lib package.json
			exec('cd "' + libDir + '" && npm install', function(err, stdout, stderr) {
				if (err) {
					return done(err);
				}

				// copy in the fake module
				var fakeModuleDir = path.join(libDir, 'node_modules', 'fake_module');
				wrench.copyDirSyncRecursive(path.join('test', 'fake_module'), fakeModuleDir);
				grunt.log.ok();
				done();
			});
		});

	});

	// create test alloy app
	grunt.registerTask('app-create', ['clean', 'titanium:create', 'alloy']);

	// run example app
	grunt.registerTask('test', ['app-create', 'app-prep', 'titanium:build']);

	// Register tasks
	grunt.registerTask('default', ['jshint', 'test']);

};

function copyFileSync(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}