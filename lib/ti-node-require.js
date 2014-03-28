var appDir = Ti.Filesystem.resourcesDirectory,
	_require = require,
	path;

module.exports = function(dirname) {
	var req = function(p) {
		return _require(req.resolve(p).replace(/\.js$/, ''));
	};

	req.resolve = function resolve(p) {
		var rawPath;

		if (p.indexOf('/') === 0) {
			rawPath = p;
		} else if (p.indexOf('../') === 0 || p.indexOf('./') === 0) {
			rawPath = dirname + (dirname === '/' ? '' : '/') + p;
		} else {
			rawPath = 'node_modules/' + p;
		}

		var resolvedPath = path.resolve(rawPath);
		var modulePath = loadAsFile(resolvedPath) || loadAsDirectory(resolvedPath);
		if (!modulePath) {
			// or should I try `_require(newPath)` and let the Titanium handle the error?
			throw new Error('Cannot find module \'' + p + '\'');
		}
		return modulePath;
	};

	return req;
};

function loadAsFile(filepath) {
	var checks = [filepath,filepath+'.js'];
	for (var i = 0, len = checks.length; i < len; i++) {
		if (getLoadableFile(checks[i])) {
			return checks[i];
		}
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
			return path.resolve(filepath + '/' + json.main);
		}
	}

	// load from index.js in the directory
	var indexFile = Ti.Filesystem.getFile(appDir, filepath + '/index.js');
	if (indexFile.exists()) {
		return filepath + '/index.js';
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
path = (function() {
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
		if (xs.filter) { return xs.filter(f); }
		var res = [];
		for (var i = 0; i < xs.length; i++) {
			if (f(xs[i], i, xs)) { res.push(xs[i]); }
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
