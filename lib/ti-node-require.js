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
			Ti.API.trace("require('" + p + "') --> require('" + newPath + "')");
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

// process shim
var process = {
	cwd: function() {
		return '/';
	}
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var path = (function() {
	var exports = {};

	function normalizeArray(parts, allowAboveRoot) {
		// if the path tries to go above the root, `up` ends up > 0
		var up = 0;
		for (var i = parts.length - 1; i >= 0; i--) {
			var last = parts[i];
			if (last === '.') {
				parts.splice(i, 1);
			} else if (last === '..') {
				parts.splice(i, 1);
				up++;
			} else if (up) {
				parts.splice(i, 1);
				up--;
			}
		}

		// if the path is allowed to go above the root, restore leading ..s
		if (allowAboveRoot) {
			for (; up--; up) {
				parts.unshift('..');
			}
		}

		return parts;
	}

	function filter (xs, f) {
		if (xs.filter) return xs.filter(f);
		var res = [];
		for (var i = 0; i < xs.length; i++) {
			if (f(xs[i], i, xs)) res.push(xs[i]);
		}
		return res;
	}

	exports.resolve = function() {
		var resolvedPath = '',
			resolvedAbsolute = false;

		for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
			var path = (i >= 0) ? arguments[i] : process.cwd();

			// Skip empty and invalid entries
			if (typeof path !== 'string') {
				throw new TypeError('Arguments to path.resolve must be strings');
			} else if (!path) {
				continue;
			}

			resolvedPath = path + '/' + resolvedPath;
			resolvedAbsolute = path.charAt(0) === '/';
		}

		// At this point the path should be resolved to a full absolute path, but
		// handle relative paths to be safe (might happen when process.cwd() fails)

		// Normalize the path
		resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
			return !!p;
		}), !resolvedAbsolute).join('/');

		return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	return exports;
})();
