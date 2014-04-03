var fs = require('fs'),
	path = require('path');

exports.cliVersion = '>=3.0';

exports.init = function (logger, config, cli, appc) {
	var handler = {
		pre: function (data) {
			var appPropsName = cli.argv.platform === 'ios' ? '_app_props__json' : '_app_props_.json';
			var appPropsFile = path.join(this.buildAssetsDir, appPropsName);
			if (fs.existsSync(appPropsFile)) {
				var json = JSON.parse(fs.readFileSync(appPropsFile));
				json.encryptedFiles = JSON.stringify(this.jsFilesToEncrypt);
				fs.writeFileSync(appPropsFile, JSON.stringify(json));
			}
		}
	};

	cli.on('build.android.titaniumprep', handler);
	cli.on('build.ios.titaniumprep', handler);
};