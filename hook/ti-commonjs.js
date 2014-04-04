var fs = require('fs'),
	path = require('path');

exports.cliVersion = '>=3.0';

exports.init = function (logger, config, cli, appc) {
	var handler = {
		pre: function (data) {
			var platform = cli.argv.platform;
			var appPropsName = platform === 'ios' ? '_app_props__json' : '_app_props_.json';
			var appPropsFile = path.join(this.buildAssetsDir, appPropsName);

			if (fs.existsSync(appPropsFile)) {
				var json = JSON.parse(fs.readFileSync(appPropsFile));
				var copy = this.jsFilesToEncrypt.slice(0);

				if (platform === 'ios') {
					for (var i = 0, len = copy.length; i < len; i++) {
						copy[i] = copy[i].replace(/\_js$/, '.js');
					}
				}
				json.encryptedFiles = JSON.stringify(copy);
				fs.writeFileSync(appPropsFile, JSON.stringify(json));
			}
		}
	};

	cli.on('build.android.titaniumprep', handler);
	cli.on('build.ios.titaniumprep', handler);
};