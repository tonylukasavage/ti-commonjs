var path = require('path');

var appDir = Ti.Filesystem.resourcesDirectory,
	_require = require;

module.exports = function(dirname) {
	return function(p) {
		var newPath, modulePath;

		if (p.indexOf('/') === 0) {
			newPath = p;
		} else if (p.indexOf('../') === 0 || p.indexOf('./') === 0) {
			newPath = path.resolve(dirname, p);
		} else {
			newPath = 'node_modules/' + p;
		}
		newPath = path.resolve(newPath).substring(1);

		modulePath = loadAsFile(newPath) || loadAsDirectory(newPath);
		if (modulePath) {
			Ti.API.info("require('" + p + "') --> require('" + newPath + "')");
			return _require(modulePath);
		} else {
			throw new Error('Failed to load module ' + p + ' (resolved as ' + modulePath + ')');
		}
	};
};

function loadAsFile(filepath) {
	var file = getLoadableFile(filepath) || getLoadableFile(filepath + '.js');
	if (file) {
		return filepath;
	}
}

function loadAsDirectory(filepath) {
	if (!Ti.Filesystem.getFile(appDir, filepath).isDirectory()) {
		return;
	}

	// require from the package.json "main" path
	var packageJsonFile = Ti.Filesystem.getFile(appDir, filepath + '/package.json');
	if (packageJsonFile.exists()) {
		var json = JSON.parse(packageJsonFile.read().text);
		if (json.main) {
			return filepath + '/' + json.main.replace(/\.js$/, '');
		}
	}

	// load from index.js in the directory
	var indexFile = Ti.Filesystem.getFile(appDir, filepath + '/index.js');
	if (indexFile.exists()) {
		return filepath + '/index';
	}
}

function getLoadableFile(filepath) {
	var file = Ti.Filesystem.getFile(appDir, filepath);
	if (file.exists() && !file.isDirectory()) {
		return file;
	}
}
