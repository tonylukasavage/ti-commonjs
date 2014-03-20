var __dirname = '/';
var __filename = '/app.js';

(function(_require) {
	var require = _require('require')(__dirname);

	var _ = require('underscore');
	var tests = [
		'/foo/bar',
		'./foo/bar',
		'./foo/../foo/bar',
		'../../../foo/./bar'
	];
	_.each(tests, function(test) {
		require(test)();
	});


})(require);
