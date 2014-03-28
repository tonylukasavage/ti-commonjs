module.exports = function(_module) {
	return _module.require('./testModuleRequire')('from /modules/moduleRequire.js');
};