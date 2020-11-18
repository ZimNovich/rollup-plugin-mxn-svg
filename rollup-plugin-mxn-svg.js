// Rollup-Plugin-MXN-SVG - Rollup plugin that imports SVG files as JSX components
// Copyright (C) 2019 Kuzivakwashe
// Copyright (C) 2020 Ilya Zimnovich <zimnovich@gmail.com>
//
// On Rollup plugin documentation see:
// - https://github.com/rollup/rollup/blob/master/docs/05-plugin-development.md

"use strict";
const { sep } = require("path");
const glob = require("@jsxtools/glob"); // Glob to RegExp

// Helper functions inspired by rollup-pluginutils
const ensureArray = function(thing) {
    if ( Array.isArray(thing) ) return thing;
    if ( thing == null || thing == undefined ) return [];
    return [ thing ];
}

const createFilter = function(include, exclude, prepend)
{
    // Convert wildcards to arrays of glob RegExps
    include = ensureArray(include).map(wildcard => prepend + wildcard ).map(wildcard => glob(wildcard) );
    exclude = ensureArray(exclude).map(wildcard => prepend + wildcard ).map(wildcard => glob(wildcard) );

    return function(id) {
        if ( typeof id !== "string" ) return false;
        if ( /\0/.test(id) ) return false;
        id = id.split(sep).join("/");

        // If options.include is omitted or of zero length, files should be included by default;
        // otherwise they should only be included if the ID matches one of the patterns.
        let included = !include.length;

        include.forEach( function(matcher) {
            if ( matcher.test(id) ) included = true;
        });

        exclude.forEach( function(matcher) {
            if ( matcher.test(id) ) included = false;
        });

        return included;
    };
}

// A Rollup plugin is an object with one or more of the properties, build hooks,
// and output generation hooks described below, and which follows our conventions.
//
// Plugins allow you to customise Rollup's behaviour by, for example, transpiling
// code before bundling, or finding third-party modules in your node_modules folder. 

module.exports = function(options) {
    // Setting default options
    const defaults = {
        imports: "import {h} from \"preact\";",
        prepend: "**/",
        clean: function(rawSVG) {
            return rawSVG
            .replace(/\s*<\?xml[\s\S]+?\?>\s*/, "") // Remove XML declaration
            .replace(/\s*<!DOCTYPE[\s\S]*?>\s*/i, "") // Remove DOCTYPE
            .replace(/[a-z]+\:[a-z]+\s*=\s*"[\s\S]+?"/ig, "") // Remove namespaced attributes
            .replace(/\s*<!\-\-[\s\S]*?\-\->\s*/ig, "") // Remove comments
        }
	};

	// Mixing mandatory and user provided arguments
	// Note: Object.assign() does not throw on null or undefined sources
	options = Object.assign(defaults, options);

	let library = ensureArray(options.imports).join("\n");

	// Ensure options.clean is configured correctly
	if ( typeof options.clean !== "function"  ) {
		throw new Error("options.clean should be a function");
	}
    
    // Creating input files filter
    const filter = createFilter(options.include, options.exclude, options.prepend);

    return {
        name: "mxn-svg", // this name will show up in warnings and errors
        // To interact with the build process, your plugin object includes 'hooks'.
		// Hooks are functions which are called at various stages of the build. 
		//
        // If a plugin transforms source code, it should generate a sourcemap
        // automatically, unless there's a specific sourceMap: false option.
        // If the transformation does not move code, you can preserve existing
        // sourcemaps by returning null
        //
        // Transformer plugins (i.e. those that return a transform function for
        // e.g. transpiling non-JS files) should support options.include and
        // options.exclude, both of which can be a minimatch pattern or an array
        // of minimatch patterns. If options.include is omitted or of zero length,
        // files should be included by default; otherwise they should only be
        // included if the ID matches one of the patterns.
        //
        transform: function(svg, id) {
            // Check if file with "id" path should be included or excluded
            if ( !filter(id) ) return null;

            let cleanedSVG = options.clean(svg);

            if ( typeof cleanedSVG !== "string" ) {
                // Check whether clean returned a Promise
                let isPromise = (
                    typeof cleanedSVG === "object" && cleanedSVG.then
                );

                if ( !isPromise ) {
                    throw new Error("options.clean did not return a string or Promise<string>");
                }
            }
            else {
                cleanedSVG = Promise.resolve(cleanedSVG);
            }

            return cleanedSVG.then(cleanedSVG => {
                // Add props:
                cleanedSVG = cleanedSVG.replace(/<svg([\s\S]*?)>/i, "<svg$1 {...props}>");
    
                return {
                    code: (
                        `${library}\n` +
                        `export default ( props ) => (${cleanedSVG});`
                    ),
                    map: { mappings: "" }
                };
            });
        }
    }
}
