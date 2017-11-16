module.exports = {
    entry: [ './src/app/main.ts', './src/app/app.module.ts' ],
    output: {
        path: './temp/',
        filename: 'app.bundle.js'
    },
    devtool: 'source-map',
    extensions: [ '', '.ts', '.js' ],
    module: {
        loaders: [
            { test: /\.ts$/, loader: "ts-loader" }
        ],
        noParse: [ 'node_modules' ]
    },
    ts: {
        compilerOptions: {
            experimentalDecorators: true,
            sourceMap: true,
            noImplicitAny: true,
            module: "commonjs",
            moduleResolution: "node",
            target: "es5"
        }
    }
};