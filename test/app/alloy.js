var $R = require('ti-node-require')('/');

var should = $R('should/should');
$R('ti-mocha');

describe('ti-node-require', function() {

	it('should work', function() {
		return true;
	});

});

mocha.run();
