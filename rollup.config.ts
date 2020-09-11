import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import license from 'rollup-plugin-license';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const pkg = require('./package.json');

const libraryName = 'ecs';

export default {
    
    input: `src/${libraryName}.ts`,
    output: [
        {
            file: pkg.main,
            name: camelCase(libraryName),
            format: 'umd',
            sourcemap: true,
            //https://github.com/rollup/rollup-plugin-babel/issues/162
            globals: {
                'uuid': 'uuid'
            }
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap:true,
            //https://github.com/rollup/rollup-plugin-babel/issues/162
            globals: {
                'uuid': 'uuid'
            }
        }
    ],
    external: [
        'uuid'
    ],
    watch: {
        include: 'src/**'
    },
    plugins: [
        // Allow json resolution
        json(),
        // Compile TypeScript files
        typescript(),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/plugins/tree/master/packages/node-resolve#usage
        resolve(),
        sourceMaps(),
        nodePolyfills(),
        license({
            banner: `-----------------------------------------------------------
       Entity Component System Framework v<%= pkg.version %>
      
       Copyright(C) <%= pkg.author.name %>
       <%= pkg.author.url %>
      -----------------------------------------------------------
      `
          })
    ]
}