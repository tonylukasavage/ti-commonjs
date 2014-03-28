(function(_require, __dirname, __filename) {
	var module = {
		exports: {}
	};
	var exports = module.exports;
	module.loaded = false;
	module.id = __filename;
	module.parent = {};
	module.children = [];
	var require = _require('ti-node-require')(__dirname, module);
	module.require = require;


	require('./test/cov_test');


	module.loaded = true;
})(require, '/', '/app.js');
