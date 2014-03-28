(function(_require, __dirname, __filename) {
	var require = _require('ti-node-require')(__dirname);

	module.exports = function() {
		return __filename;
	};

})(require, '/modules/foo', '/modules/foo/bar.js');
