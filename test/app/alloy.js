var should = require('should/should');
require('ti-mocha');

describe('app.js', function() {

	it('"module.id" should equal "."', function() {
		should.exist(module);
		should.exist(module.id);
		module.id.should.equal('.');
	});

	it('should have a valid list in "require.paths"', function() {
		should.exist(require.paths);
		require.paths.should.eql([
			'/node_modules'
		]);
	});

});

require('./test');
