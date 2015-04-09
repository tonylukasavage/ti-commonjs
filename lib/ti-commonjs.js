var appDir = Ti.Filesystem.resourcesDirectory,
	fileProp = Ti.App.Properties.getString('encryptedFiles'),
	encryptedFiles = fileProp ? JSON.parse(fileProp) : null,
	jsFileExists = encryptedFiles ? getLoadableEncyptedFile : getLoadableFile,
	_require = require,
	cache = {},
	path;

module.exports = function(dirname, _module) {
	var req = function(p) {

		// attempt to load cache from raw path
		var cached = req.cache[p];
		if (cached) { return cached; }

		// attempt to load cache from resolved path
		var resolved = req.resolve(p);
		cached = req.cache[resolved];
		if (cached) { return cached; }

		// load as JSON file
		var loaded;
		if (/\.json$/.test(resolved)) {
			var jsonFile = Ti.Filesystem.getFile(appDir, resolved);
			loaded = JSON.parse(jsonFile.read().text);

		// load as module
		} else {
			loaded = _require(resolved.replace(/\.js$/, ''));
			req.cache[resolved] = req.cache[p] = loaded;
		}

		return loaded;
	};

	// cache loaded modules
	req.cache = cache;

	// list of valid node_modules paths for this require
	req.paths = getRequirePaths(dirname);

	// reference to the main module (app.js)
	req.main = __mainModule; // jshint ignore:line

	// resolve the given module id to a path
	req.resolve = function resolve(p) {
		var isNodeModule = false,
			rawPath;

		if (p.indexOf('/') === 0) {
			rawPath = p;
		} else if (p.indexOf('../') === 0 || p.indexOf('./') === 0) {
			rawPath = dirname + (dirname === '/' ? '' : '/') + p;
		} else {
			isNodeModule = true;
			rawPath = p;
		}

		var resolvedPath = path.resolve(rawPath),
			modulePath;

		if (isNodeModule) {
			for (var i = 0, len = req.paths.length; i < len; i++) {
				var newResolvedPath = req.paths[i] + resolvedPath;
				modulePath = loadAsFile(newResolvedPath) || loadAsDirectory(newResolvedPath);
				if (modulePath) { break; }
			}
		} else {
			modulePath = loadAsFile(resolvedPath) || loadAsDirectory(resolvedPath);
		}

		if (!modulePath) {
			var err = new Error("Cannot find module '" + p + "' loaded from '" + _module.filename + "'");
			err.code = 'MODULE_NOT_FOUND';
			throw err;
		}
		return modulePath;
	};

	return req;
};

function getRequirePaths(dirname) {
	if (dirname === '/') {
		return ['/node_modules'];
	}

	var paths = [];
	var parts = dirname.split('/');
	for (var i = 0, len = parts.length; i < len; i++) {
		var p = parts.slice(0, len-i);
		paths.push(p.join('/') + '/node_modules');
	}

	return paths;
}

function loadAsFile(filepath) {
	var checks = [filepath,filepath+'.js',filepath+'.json'];
	for (var i = 0, len = checks.length; i < len; i++) {
		var check = checks[i],
			isJs = /\.js$/.test(check);

		if ((isJs && jsFileExists(check)) || (!isJs && getLoadableFile(check))) {
			return check;
		}
	}
}

function loadAsDirectory(filepath) {

	// require from the package.json "main" path
	var packageJsonFile = Ti.Filesystem.getFile(appDir, filepath + '/package.json');
	if (packageJsonFile.exists()) {
		var json = JSON.parse(packageJsonFile.read().text);
		if (json.main) {
			return path.resolve(filepath + '/' + json.main);
		}
	}

	// load from index.js in the directory
	var indexFile = filepath + '/index.js';
	if (jsFileExists(indexFile)) {
		return indexFile;
	}

}

function getLoadableFile(filepath) {
	var file = Ti.Filesystem.getFile(appDir, filepath.replace(/^\//, ''));
	return file.exists() && !file.isDirectory();
}

function getLoadableEncyptedFile(filepath) {
	return encryptedFiles.indexOf(filepath.replace(/^\//, '')) !== -1;
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
