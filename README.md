# ti-node-require [![Appcelerator Titanium](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://www.appcelerator.com/titanium/alloy/) [![Gittip](http://img.shields.io/gittip/Tony%20Lukasavage.png)](https://www.gittip.com/Tony%20Lukasavage/)

Node.js-style `require()` in Appcelerator Titanium via Alloy. For full details on what exactly this means, check out Node.js's own [documentation on modules](http://nodejs.org/api/modules.html). In addition to this added functionality, ti-node-require.js also eliminates _all_ platform-specific disparities in Titanium's CommonJS implementation.

## Install

Execute the following in your project's root folder.

```
npm install ti-node-require
```

It will install the `ti-node-require.js` module in your application, as well as the `alloy.jmk` file (or modifications to existing alloy.jmk) necessary to post-process your generated runtime files. Check out the section below to see how this changes and improves `require()` in your Titanium apps.

## Core Differences

Titanium's [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) implementation deviates from the node.js's in a number of ways. Here's a few snippets to show the differences, and some of the things that ti-node-require.js supports that vanilla Titanium does not.

#### absolute paths (relative to "Resources" folder)

```javascript
// Titanium
require('foo/bar');

// ti-node-require.js
require('/foo/bar');
```

#### relative paths

Titanium and ti-node-require.js have the same usage here, but ti-node-require.js eliminates Titanium's cross-platform disparities. It will work as expected on all platforms.

```javascript
require('../../someModule');
require('./someModuleInCurrentFolder');
require('.././some/ridiculous/../../path');
```

## New Functionality

The following functionality exists only with ti-node-require.js and has no direct equivalent in vanilla Titanium.

#### loading from `node_modules` folder

Load modules installed via npm in `Resources/node_modules`. Full details [here](http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders).

```javascript
require('underscore');
require('ti-mocha');
```

> **NOTE:** This will obviously only work with node.js modules that are comptaible with the Titanium environment.

#### folders as modules

A module named `index.js` can be referenced just by its folder's name.

```javascript
// assuming the module "Resources/foo/index.js" exists...
require('/foo');
```

Additionally, if a folder contains a `package.json`, ti-node-require.js will check the `main` property and use the path listed there to load as a module. The following, for example, will load the module located at "/foo/lib/quux.js".

**/foo/package.json**
```json
{
	"main": "./lib/quux"
}
```

**/app.js**
```javascript
// assuming the module "Resources/foo/lib/quux.js" exists...
require('/foo');
```

Full details [here](http://nodejs.org/api/modules.html#modules_folders_as_modules).

## Caveats

* This implementation does not load modules with the `.node` extension, as those are for node.js compiled addon modules, which make no sense in the context of Titanium.