console.log('module.id: ' + module.id);

(function(_require, __dirname, __filename) {
	var require = _require('ti-node-require')(__dirname);

	var should = require('should/should');
	require('ti-mocha');

	console.log('module.id: ' + module.id);

	describe('ti-node-require', function() {

		it('should define module as an object', function() {
			should.exist(module);
			module.should.be.an.Object;
		});

	});

	mocha.run();

})(require, '/test', '/test/cov_test.js');