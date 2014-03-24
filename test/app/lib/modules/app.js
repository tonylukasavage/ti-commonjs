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
