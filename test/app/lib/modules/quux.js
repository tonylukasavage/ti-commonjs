(function(_require, __dirname, __filename) {
	module.loaded = false;
	module.id = __filename;
	module.parent = {};
	module.children = [];
	var require = _require('ti-node-require')(__dirname, module);
	module.require = require;


	module.exports = function() {
		return 'quux';
	};


	module.loaded = true;
})(require, '/modules', '/modules/quux.js');