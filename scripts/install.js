var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	xmldom = require('xmldom');

var pkg = require('../package'),
	NAME = pkg.name,
	VERSION = pkg.version;

var root = path.join(process.cwd(),'..','..','..','..'),
	appDir = path.join(root, 'app'),
	src = path.join(__dirname, '..', 'lib', 'alloy.jmk'),
	dst = path.join(appDir, 'alloy.jmk');

// install alloy.jmk
if (fs.existsSync(appDir)) {
	if (!fs.existsSync(dst)) {
		copyFileSync(src, dst);
	} else {
		var content = fs.readFileSync(dst);
		if (!/function\s+wrapFile/.test(content)) {
			fs.appendFileSync(dst, fs.readFileSync(src));
		}
	}
}

// install hook
var hookDir = path.join(root, 'plugins', NAME, VERSION, 'hooks');
wrench.mkdirSyncRecursive(hookDir, true);
copyFileSync(path.join(__dirname,'..','hook',NAME+'.js'), path.join(hookDir,NAME+'.js'));

// write entry to tiapp.xml
var tiapp = path.join(root, 'tiapp.xml'),
	xmldom = require("xmldom"),
	doc = new xmldom.DOMParser().parseFromString(fs.readFileSync(tiapp, 'utf8'));

// Determine if the module or plugin is already installed
var collection = doc.documentElement.getElementsByTagName('plugins');
var found = false;
if (collection.length > 0) {
	var items = collection.item(0).getElementsByTagName('plugin');
	if (items.length > 0) {
		for (var c = 0; c < items.length; c++) {
			var theItem = items.item(c);
			var theItemText = getNodeText(theItem);
			if (theItemText === NAME) {
				found = true;
				break;
			}
		}
	}
}

// install module or plugin
if (!found) {
	// create the node to be inserted
	var node = doc.createElement('plugin');
	var text = doc.createTextNode(NAME);
	node.setAttribute('platform','android,iphone');
	node.setAttribute('version',VERSION);
	node.appendChild(text);

	// add the node into tiapp.xml
	var pna = null;
	if (collection.length === 0) {
		var pn = doc.createElement('plugins');
		doc.documentElement.appendChild(pn);
		doc.documentElement.appendChild(doc.createTextNode("\n"));
		pna = pn;
	} else {
		pna = collection.item(0);
	}
	pna.appendChild(node);
	pna.appendChild(doc.createTextNode("\n"));

	// serialize the xml and write to tiapp.xml
	var serializer = new xmldom.XMLSerializer();
	var newxml = serializer.serializeToString(doc);
	fs.writeFileSync(tiapp, newxml, 'utf8');
}

function getNodeText(node) {
	var serializer = new xmldom.XMLSerializer(),
		str = '';
	for (var c = 0; c < node.childNodes.length; c++) {
		if (node.childNodes[c].nodeType === 3) {
			str += serializer.serializeToString(node.childNodes[c]);
		}
	}
	return str.replace(/\&amp;/g,'&');
}

function copyFileSync(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}
