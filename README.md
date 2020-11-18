# rollup-plugin-mxn-svg

[![npm@latest](https://badgen.net/npm/v/rollup-plugin-mxn-svg)](https://www.npmjs.com/package/rollup-plugin-mxn-svg)
[![Install size](https://packagephobia.now.sh/badge?p=rollup-plugin-mxn-svg)](https://packagephobia.now.sh/result?p=rollup-plugin-mxn-svg)
[![Downloads](https://img.shields.io/npm/dm/rollup-plugin-mxn-svg.svg)](https://npmjs.com/rollup-plugin-mxn-svg)

A Rollup plugin that imports SVG files as JSX components.

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

This plugin has the following options:

| Property    | Description    | Default    |
|-------------|----------------|------------|
| `imports`   | The options object | `undefined` |
This can be a single minimatch glob pattern, or an array of them. Default is ./**.
| `include` | A single glob pattern, or an array of them. It specifies which files to include.<br/>More at <a href="https://rollupjs.org/guide/en#transformers" target="_blank">rollupjs.org</a>. | `"**/*.svg"` |
| `exclude` | <a href="https://github.com/isaacs/minimatch" target="_blank">Minimatch pattern(s)</a> to exclude.<br/>More at <a href="https://rollupjs.org/guide/en#transformers" target="_blank">rollupjs.org</a>. | `undefined` |



| <code id="jsx">options.jsx</code> | The JSX library or <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Syntax" target="_blank">module name</a> to use e.g. `"preact"` or `"react"` (**required**) | `undefined` |
| <code id="factory">options.factory</code> | The JSX <a href="https://jasonformat.com/wtf-is-jsx/#thepragma" target="_blank">pragma</a>&mdash;the function used for compiling each JSX node **e.g.** `preact.h` or `React.createElement` | `undefined` |
| <code id="default">options.default</code> | Whether or not the [`options.factory`](#factory) is the `default` export of the provided [`options.jsx`](#jsx) library.<br/>If `false`, the provided [`options.jsx`](#jsx) will be a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#Description" target="_blank">named `export`</a> | `true` |
| <code id="clean">options.clean</code> | The function used to clean up/ prepare the SVG for inlining. It removes the `DOCTYPE`, XML declaration, comments and namespaced attributes and has a `(rawSVG) => string` or `(rawSVG) => Promise<string>` function signature | `function` |
| `include` | <a href="https://github.com/isaacs/minimatch" target="_blank">Minimatch pattern(s)</a> to include.<br/>More at <a href="https://rollupjs.org/guide/en#transformers" target="_blank">rollupjs.org</a>. | `"**/*.svg"` |
| `exclude` | <a href="https://github.com/isaacs/minimatch" target="_blank">Minimatch pattern(s)</a> to exclude.<br/>More at <a href="https://rollupjs.org/guide/en#transformers" target="_blank">rollupjs.org</a>. | `undefined` |

## Usage

We suggest you to load the module via `require` until the stabilization of ES modules in Node.js:
```javascript
const transform = require("mxn-jsx-ast-transformer");
```

Now you can transform ("desugar") all JSX elements into JS calls as follows:
```javascript
let ast = transform(jsx_ast[, options]);
```

Where
 - `jsx_ast` {Object} - ESTree-compilant JSX AST to transform to regular JS AST
 - `options` {Object} - options for JSX ⇒ JS transformation

The default values for the `options` object are shown below:
```javascript
{
    factory: "h",         // factory function to use, e.g. `h`, `m`, `React.createElement`
    quotePropNames: true  // put property names into quotes
}
```

Below is an advanced usage example:

```javascript
let ast = transform(jsx_ast, { factory: "React.createElement", quotePropNames: false });
```

Please note that this tool only converts JSX AST into regular ES5-compliant JavaScript AST. If you want to transpile your source code, check out [mxn-jsx-transpiler](https://github.com/ZimNovich/mxn-jsx-transpiler) or use a code like:

```javascript
// Acorn & Astring
const acorn = require("acorn");
const acornJsx = require("acorn-jsx");
const { generate } = require("astring");

// MXN JSX AST Transformer
const transform = require("mxn-jsx-ast-transformer");

// Create parser
let parser = acorn.Parser.extend(acornJsx({
    allowNamespaces: false
}) );

let code = 'let a = <Greeting firstName="Maximilian" lastName="Pierpont" age={1 + 2 + 3 + 4} />;';

let ast = parser.parse(code, {
    ecmaVersion: 2020,
    sourceType: "module",
    locations: false,
    plugins: { jsx: true }
});

// Transform AST
let ast_new = transform(ast, { factory: "h" });

// Generate code
let transformedCode = generate(ast_new, {
    indent: "    ",
    lineEnd: "\n",
    comments: false
});
```

## License

This module is released under the MIT license.

## Related

- [mxn-jsx-transpiler](https://github.com/ZimNovich/mxn-jsx-transpiler) - Transpiles JSX to regular JavaScript
- [rollup-plugin-mxn-jsx](https://github.com/ZimNovich/rollup-plugin-mxn-jsx) - Rollup JSX plugin that transpiles JSX into JavaScript


















### Configuration

The `config` object passed to the plugin is composed of the following properties:

| Property | Description | Default |
| -------- | ----------- | ------- |
| `options` | The options object | `undefined` |
| <code id="jsx">options.jsx</code> | The JSX library or <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Syntax" target="_blank">module name</a> to use e.g. `"preact"` or `"react"` (**required**) | `undefined` |
| <code id="factory">options.factory</code> | The JSX <a href="https://jasonformat.com/wtf-is-jsx/#thepragma" target="_blank">pragma</a>&mdash;the function used for compiling each JSX node **e.g.** `preact.h` or `React.createElement` | `undefined` |
| <code id="default">options.default</code> | Whether or not the [`options.factory`](#factory) is the `default` export of the provided [`options.jsx`](#jsx) library.<br/>If `false`, the provided [`options.jsx`](#jsx) will be a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#Description" target="_blank">named `export`</a> | `true` |
| <code id="clean">options.clean</code> | The function used to clean up/ prepare the SVG for inlining. It removes the `DOCTYPE`, XML declaration, comments and namespaced attributes and has a `(rawSVG) => string` or `(rawSVG) => Promise<string>` function signature | `function` |
| `exclude` | <a href="https://github.com/isaacs/minimatch" target="_blank">Minimatch pattern(s)</a> to exclude.<br/>More at <a href="https://rollupjs.org/guide/en#transformers" target="_blank">rollupjs.org</a>. | `undefined` |
| `include` | <a href="https://github.com/isaacs/minimatch" target="_blank">Minimatch pattern(s)</a> to include.<br/>More at <a href="https://rollupjs.org/guide/en#transformers" target="_blank">rollupjs.org</a>. | `"**/*.svg"` |

### Examples

Here are some complete `rollup.config.js` and starter project examples for:

 - [Preact](https://github.com/kuzivany/simple-preact-rollup)
 - [React, Inferno](https://github.com/kuzivany/simple-rollup-starter)

#### Basic example

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

#### Advanced examples

##### Specifying a library

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

**[See full _library_ example here](https://github.com/kuzivany/simple-rollup-starters/tree/master/inferno)**

##### Using SVGO

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

SVG files are `import`ed as functional components which accept `props`.
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
