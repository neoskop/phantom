import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';

const globals = {
    '@angular/core': 'ng.core',
    '@neoskop/annotation-factory': 'neoskop.annotation_factory'
};

export default {
    input: 'dist/public_api.js',
    external: Object.keys(globals),
    output: {
        globals,
        format: 'umd',
        name: 'neoskop.phantom',
        file: 'bundle/phantom.bundle.js',
        sourcemap: true,
        amd: {
            id: '@neoskop/phantom'
        }
    },
    plugins: [
        resolve(),
        commonjs(),
        sourcemaps()
    ],
    treeshake: true
}
