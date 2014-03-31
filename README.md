# ti-node-require [![Appcelerator Titanium](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://www.appcelerator.com/titanium/alloy/) [![Gittip](http://img.shields.io/gittip/Tony%20Lukasavage.png)](https://www.gittip.com/Tony%20Lukasavage/)

> **NOT YET FUNCTIONAL**

Node.js-style `require()` in Appcelerator Titanium via Alloy. For full details on what exactly this means, check out Node.js's own [documentation on modules](http://nodejs.org/api/modules.html). In addition to this added functionality, `ti-node-require.js` also eliminates _all_ platform-specific disparities in Titanium's CommonJS implementation.

## Install [![NPM version](https://badge.fury.io/js/ti-node-require.png)](http://badge.fury.io/js/ti-node-require)

Execute the following in your project's root folder.

```
npm install ti-node-require
```

It will install the `ti-node-require.js` module in your application, as well as the `alloy.jmk` file (or modifications to existing alloy.jmk) necessary to post-process your generated runtime files. Check out the section below to see how this changes and improves `require()` in your Titanium apps.

## Usage

### absolute paths (relative to "Resources" folder)

```javascript
require('/foo/bar');
```

### relative paths

```javascript
require('../../someModule');
require('./someModuleInCurrentFolder');
require('.././some/ridiculous/../../path');
```

### loading from `node_modules` folder

Load modules installed via npm in `Resources/node_modules`. Full details [here](http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders).

```javascript
var _ = require('underscore');
require('ti-mocha');
```

You can also target specific files within those npm installations. For example, let's take [should.js](https://github.com/visionmedia/should.js/). While you can't require it directly in Titanium, due to its reliance on node.js libraries, you can reference the single-file Titanium-compatible version embedded in the installation. This tactic works with almost every npm distributed module that has a browser-compatible version.

```js
var should = require('should'); // ERROR - missing node.js libraries

var should = require('should/should'); // WOOHOO! It works in Titanium.
```

### folders as modules

If a folder contains a `package.json`, the path in its `main` property will be loaded as a module. Additionally, a module named `index.js` can be referenced just by its folder's name. The following example demonstrates both uses. Full details [here](http://nodejs.org/api/modules.html#modules_folders_as_modules).

#### /foo/package.json
```json
{
	"main": "./lib/quux"
}
```

#### /app.js
```javascript
// assuming the module "Resources/foo/lib/quux.js" exists...
var foo = require('/foo');

// assuming the module "Resources/bar/index.js" exists...
var bar = require('/bar');
```

### require.resolve()

Get the full path resolved path to a module.

```js
require.resolve('/foo/bar.js') === require.resolve('/.././foo/../foo/bar');
```

### load module with or without extensions

```js
require('/foo') === require('/foo.js')
```

### `module` object

Titanium's implementation gives limited access to the properties of the `module` object. With `ti-node-require.js` you have full access to the following properties and functions. Full details [here](http://nodejs.org/api/modules.html#modules_the_module_object).

* [module.exports](http://nodejs.org/api/modules.html#modules_module_exports)
* [exports](http://nodejs.org/api/modules.html#modules_exports_alias)
* [module.require(id)](http://nodejs.org/api/modules.html#modules_module_require_id)
* [module.id](http://nodejs.org/api/modules.html#modules_module_id)
* [module.filename](http://nodejs.org/api/modules.html#modules_module_filename)
* [module.loaded](http://nodejs.org/api/modules.html#modules_module_loaded)
* [module.parent](http://nodejs.org/api/modules.html#modules_module_parent) (_not yet implemented_)
* [module.children](http://nodejs.org/api/modules.html#modules_module_children) (_not yet implemented_)

### Use the Titanium require()

Just in case you still need to use the old `require()` from Titanium, it's still accessible via `tirequire()`.

```js
require('/foo') === tirequire('foo')
```

## FAQ

* [Should I use ti-node-require.js?](#should-i-use-ti-node-requirejs)
* [How does it work?](#how-does-it-work)
* Why is this solution so complicated?
	* [Why can't I just create a new `require` variable?](#why-cant-i-just-create-a-new-require-variable)
	* [Why can't I just override `require()` in my app.js?](#why-cant-i-just-override-require-in-my-appjs)
* [What are the caveats?](#what-are-the-caveats)

### Should I use `ti-node-require.js`?

#### cons

* It will probably break your existing Titanium code. The primary reason for this is fundamental difference in specifying absolute paths with Titanium's `require()` vs. `ti-node-require.js`. This example illustrates, assuming that a module exists at `Resources/foo/bar.js`:
```js
// This is how it's done with Titanium's require()
require('foo/bar');

// and this is how its done with ti-node-require.js
require('/foo/bar');
```

#### pros

* This is the CommonJS implementation and `require()` usage that will be supported in Titanium 4.0 (Lovingly being referred to as [Ti.Next](http://www.appcelerator.com/blog/2013/09/updates-on-ti-next/)). You can start future-proofing your apps now.
* You get all of the great features listed in the [New Functionality](#new-functionality) section.
* You can install and distribute modules via [npm](https://www.npmjs.org/)! no more digging through github or Q&A posts.
* Eliminates all platform-specific disparities in Titanium's CommonJS implementation.
* It becomes _much_ easier to port existing node.js modules to Titanium. Many you'll be able to use now without any modifications.
* It is much easier for incoming node.js developers to start using Titanium with this more familiar CommonJS implementation.

### How does it work?

`ti-node-require.js` overides the existing Titanium `require()` to have node.js-style functionality. It sits directly on top of Titanium's existing module implementation so all module caching is preserved, no wheels are re-invented. It does this by invoking the main `ti-node-require` function with the current `__dirname` then returns a curried function as the new `require()`.

To truly make the usage seamless, though, your generated Javascript files need a CommonJS wrapper, much like is done in the underlying engine itself. The wrapper looks like this:

**app.js**
```js
(function(_require,__dirname,__filename) {
	var require = _require('ti-node-require')(__dirname);

	// your code..

})(require,'/','/app.js');
```

### Why can't I just create a new `require` variable?

Because you'd be conflicting with the `require` already in the scope of every module.

```js
var require = require('ti-node-require'); // CONFLICT with global require
```

### Why can't I just override `require()` in my app.js?

I should just be able to take advantage of Titanium's scoping with respect to the app.js file and have `require()` overridden everywhere, right? Well, you're right, but that's where the problem lies. The issue is that `require()` needs to be executed relative to the current file's directory when it comes to relative paths. Globally overriding `require()`, though, will make all relative paths relative to `Resources`. Let me demonstrate.

**app.js**
```js
require = require('ti-node-require');
require('/1/2/3/threeModule')();
```

**1/2/3/threeModule.js**
```js
module.exports = function() {
	// DISASTER! You'd think you were referencing '/1/2/3/../twoModule' here,
	// but because the relative directory was established in the app.js
	// you are instead referencing '/../twoModule'. This will end in a
	// runtime error.
	require('../twoModule')();
};
```

**1/2/twoModule.js**
```js
module.exports = function() {
	console.log();
};
```

### What are the caveats?

* `module.id` will _not_ have the module's file extension like it does in node.js. This is because the underlying Titanium implementation applies the `module.id` without the extension and makes it immutable.
* `.json` files are not yet supported.
* This implementation does not load modules with the `.node` extension, as those are for node.js compiled addon modules, which make no sense in the context of Titanium.
* `ti-node-require.js` does not load from global folders (i.e., `$HOME/.node_modules`), as they are not relevant to mobile app distributions.
