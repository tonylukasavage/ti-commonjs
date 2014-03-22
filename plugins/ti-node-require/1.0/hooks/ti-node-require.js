exports.cliVersion = '>=3.X';

exports.init = function (logger, config, cli, appc) {

	cli.addHook('build.pre.compile', function (build, done) {
		console.log(process.cwd());
		console.log('*****************************');
		console.log('*****************************');
		console.log('*****************************');
		console.log('*****************************');
		console.log('*****************************');
		return done();
	});

};
