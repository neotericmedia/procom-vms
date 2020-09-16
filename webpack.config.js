var webpack = require('webpack');

var config = {
    entry: {
        // Manifest builder in gulpfile.js seemingly orders items. We need to keep the order of scripts on the page.
        appNext01Vendor: ['core-js/client/shim.min.js', 'zone.js', 'reflect-metadata/Reflect.js'],
        appNext02: './Phoenix/appNext/main'
        },
    output: {
        devtoolLineToLine: true,
        sourceMapFilename: "[file].map",
        pathinfo: true,
        path: __dirname + '/Site/build/', // 'webpack-stream' uses the path from gulp.dest(), i.e. config.paths.webpackDest from gulp.config.js   
        filename: "[name].bundle.js"
    },
    devtool: 'source-map',
    resolve: {
        extensions: ["", ".ts", ".js"]
    },
    module: {
        loaders: [{
            test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/
        }]
    },
    plugins: []
};

if (/*process.env.NODE_ENV == 'production'*/ 1===0) {
    //config.output.path = __dirname + '/dist';
    var uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        });
    config.plugins.push(uglifyJsPlugin);
}

//console.log('qwe', process.env);

module.exports = config;