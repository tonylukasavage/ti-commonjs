var fs = require('fs'),
	path = require('path');

var root = path.join(process.cwd(),'..','..','..','..'),
	appDir = path.join(root, 'app'),
	src = path.join(__dirname, '..', 'lib', 'alloy.jmk'),
	dst = path.join(appDir, 'alloy.jmk');

if (fs.existsSync(appDir)) {
	if (!fs.existsSync(dst)) {
		fs.writeFileSync(dst, fs.readFileSync(src));
	} else {
		var content = fs.readFileSync(dst);
		if (!/function\s+wrapFile/.test(content)) {
			fs.appendFileSync(dst, fs.readFileSync(src));
		}
	}
}
