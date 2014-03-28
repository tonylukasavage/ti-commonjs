(function(_require, __dirname, __filename) {
	var require = _require('ti-node-require')(__dirname);


	var should = require('should/should');
	require('ti-mocha');

	console.log('module.id: ' + module.id);

	describe('ti-node-require', function() {

		describe('require()', function() {

			it('should be a function', function() {
				should.exist(require);
				require.should.be.a.Function;
			});

			it('should load modules via absolute paths', function() {
				var quux = require('/modules/quux');
				should.exist(quux);
				quux.should.be.a.Function;
				quux().should.equal('quux');
			});

		});

		describe('free variables', function() {

			it('"module" should be an object', function() {
				should.exist(module);
				module.should.be.an.Object;
			});

			it('"module.exports" should be an object', function() {
				should.exist(module.exports);
				module.exports.should.be.an.Object;
			});

			it('"exports" should be an object', function() {
				should.exist(exports);
				exports.should.be.an.Object;
			});

			it('"exports" should equal "module.exports"', function() {
				should.exist(exports);
				exports.should.equal(module.exports);
			});

			it('"module.id" should be the module\'s fully resolved filename', function() {
				module.id.should.equal(__filename);
			});

			it('"module.require" should be a function', function() {
				should.exist(module.require);
				module.require.should.be.a.Function;
			});

			it('"module.require" should equal this module\'s "require"', function() {
				should.exist(module.require);
				module.require.should.equal(require);
			});

			it('"module.require" should require modules as though called from this module');

			it('"module.filename" should be the module\'s fully resolved filename', function() {
				module.id.should.equal(__filename);
			});

			it('"module.loaded" should be boolean', function() {
				should.exist(module.loaded);
				module.loaded.should.be.Boolean;
			});

			it('"module.parent" should be an object', function() {
				should.exist(module.parent);
				module.parent.should.be.an.Object;
			});

			it('"module.parent" should equal parent module object');

			it('"module.children" should be an array', function() {
				should.exist(module.children);
				module.parent.should.be.an.Array;
			});

			it('"module.children" should contain an array of modules required from this module');

		});

	});

	mocha.run();


})(require, '/test', '/test/cov_test.js');