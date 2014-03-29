(function(_require, __dirname, __filename) {
	module.loaded = false;
	module.id = __filename.replace(/\.(?:js|json)$/, '');
	module.filename = __filename;
	module.parent = {};
	module.children = [];
	var require = _require('ti-node-require')(__dirname, module);
	module.require = require;


	module.exports = function() {
		return 'twoModule.js';
	};


	module.loaded = true;
})(require, '/modules/1/2', '/modules/1/2/twoModule.js');