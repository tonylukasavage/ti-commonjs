var __dirname = '/foo';
var __filename = '/foo/bar.js';

(function(_require) {
	var require = _require('require')(__dirname);


	module.exports = function() {
		require('../quux')();
	};


})(require);
