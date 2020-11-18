# rollup-plugin-mxn-svg

[![npm@latest](https://badgen.net/npm/v/rollup-plugin-mxn-svg)](https://www.npmjs.com/package/rollup-plugin-mxn-svg)
[![Install size](https://packagephobia.now.sh/badge?p=rollup-plugin-mxn-svg)](https://packagephobia.now.sh/result?p=rollup-plugin-mxn-svg)
[![Downloads](https://img.shields.io/npm/dm/rollup-plugin-mxn-svg.svg)](https://npmjs.com/rollup-plugin-mxn-svg)

A Rollup plugin that imports SVG files as JSX components.
It was forked by Ilya Zimnovich from [rollup-plugin-svgi](https://github.com/kuzivany/rollup-plugin-svgi), originally written by Kuzivakwashe.

- ~5.5kb size
- ~2.5kb minified + gzipped

## Purpose

This is a <a href="http://rollupjs.org/" target="_blank">Rollup</a> plugin for importing SVG as JSX components in <a href="http://preactjs.com/" target="_blank">Preact</a>, <a href="https://reactjs.org/" target="_blank">React</a> and other [libraries](#examples).
<!-- inlining SVG elements as components -->

## Install

```
$ npm install --save-dev rollup-plugin-mxn-svg
```

## Usage

_Note. Use this plugin **before** any JSX ⇒ JS transformation plugins so JSX output from this plugin will be converted to regular JS calls._

Suppose an input file containing the snippet below exists at `src/index.js`, and attempts to load `src/logo.svg` as follows:

```js
// src/index.js
import Logo from './logo.svg';

console.log(Logo);
```

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
// rollup.config.js
import rollupMxnSvg from "rollup-plugin-mxn-svg";
import rollupMxnJsx from "rollup-plugin-mxn-jsx";
// ... other imports, etc ...

export default {
	input: "src/index.js",
	// ...
	output: {
		file: "bundle/bundle.js",
		format: "iife"
	},
	plugins: [
		rollupMxnSvg({
			imports: "import {h} from \"preact\";",
			include: "*.svg"
		}),
		rollupMxnJsx({
			factory: "h",
			include: ["*.js", "*.jsx", "*.svg"]
		}),
		// ... other plugins, etc ...
	]
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

This plugin has the following configuration options:

| Property    | Description    | Default    |
|-------------|----------------|------------|
| `imports`   | The options object | `"import {h} from \"preact\";"` |
| `include`   | This property specifies which files to include. It is a single [glob pattern](https://en.wikipedia.org/wiki/Glob_(programming)), or an array of them. | `"*.svg"` |
| `exclude`   | This property is the same as `include`, except it specifies which files to exclude.<br/>It is a single [glob pattern](https://en.wikipedia.org/wiki/Glob_(programming)), or an array of them. | `undefined` |
| `prepend`   | The string to prepend to `include` and `exclude` entries | `"**/"` |
| `clean`     | The function used to clean up & prepare an SVG file for inlining. It removes the `DOCTYPE`, XML declaration, comments and namespaced attributes and has a `(rawSVG) => string` or `(rawSVG) => Promise<string>` function signature. | `function` |


## Examples

```javascript
// main.js
import { h } from 'preact'; // OR import React from 'react';
import Logo from 'path/to/logo.svg';

export default () => (
  <div class="App">
    <div class="App-header">
      <Logo class="App-logo" />
    </div>
  </div>
);
```

```javascript
// rollup.config.js
import svg from 'rollup-plugin-mxn-svg';

export default {
  entry: 'main.js',
  // ...
  plugins: [
    svg({
      options: {
        jsx: 'preact', // Your chosen JSX library
      },
    }),
  ]
}
```

### Specifying a library

```javascript
// rollup.config.js
import svg from 'rollup-plugin-mxn-svg';

export default {
  entry: 'main.js',
  plugins: [
    svg({
      options: {
        jsx: 'inferno-create-element',
        factory: 'createElement',
        'default': false // import { createElement } from 'inferno-create-element';
      },
    }),
  ]
}
```

### Using SVGO

[`options.clean`](#clean) allows you to specify a custom function to remove any unnecessary elements in your SVG files.

<a href="https://github.com/svg/svgo" target="_blank">SVGO</a> can be used through [`options.clean`](#clean) to optimise your SVG files:

```js
// rollup.config.js
import svg  from 'rollup-plugin-mxn-svg';
import SVGO from 'svgo';

export default {
  entry: 'main.js',
  plugins: [
    svg({
      options: {
        jsx: 'react',
        clean: rawSVG => (
          new SVGO({
            plugins: [
              {removeDoctype: true},
              {removeXMLNS: true},
              {removeComments: true},
              {removeViewBox: false},
            ]
          }).optimize(rawSVG).then(optzSvg => optzSvg.data)
        )
      }
    })
  ]
}
```

**[Full _SVGO_ example here](https://github.com/kuzivany/simple-rollup-starters/tree/master/react)**

## Internals

SVG files are imported as functional components which accept `props`.
An example `logo.svg` file:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by hand -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" version="1.1" viewBox="-50 -50 100 100">
  <circle cx="0" cy="0" fill="red" r="25"/>
</svg>
```

`import`ed in a javascript file:

```jsx
import Logo from 'path/to/logo.svg';
```

makes this available in your code:

```jsx
const Logo = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1" viewBox="-50 -50 100 100" {...props}>
    <circle cx="0" cy="0" fill="red" r="25"/>
  </svg>
)
```

## License

This module is released under the MIT license.

## Related

- [rollup-plugin-mxn-jsx](https://github.com/ZimNovich/rollup-plugin-mxn-jsx) - Rollup JSX plugin that transpiles JSX into JavaScript
- [mxn-jsx-ast-transformer](https://github.com/ZimNovich/mxn-jsx-ast-transformer) - Transforms JSX AST into regular JS AST
- [mxn-jsx-transpiler](https://github.com/ZimNovich/mxn-jsx-transpiler) - Transpiles JSX to regular JavaScript
