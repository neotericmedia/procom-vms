var gulp = require("gulp");
var config = require("./gulp.config.js");
var runSequence = require('run-sequence');
var debug = require('gulp-debug');
var bower = require('main-bower-files');
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var fs = require("fs");
var file = require('vinyl-file');
var del = require("del");
var path = require("path");
var ignore = require("gulp-ignore");
var foreach = require('gulp-foreach');
var rework = require('gulp-rework');
var reworkUrl = require('rework-plugin-url');
var manifest = require("gulp-asset-manifest");
var less = require("gulp-less");
var gutil = require('gulp-util');
var mergeStream = require('merge-stream');
var templateCache = require('gulp-angular-templatecache');
var gulpif = require("gulp-if");
var cached = require('gulp-cached');
var jshint = require("gulp-jshint");
var stylish = require("jshint-stylish");
var clear = require('clear');
var rev = require("gulp-rev");
//var minifyCss = require("gulp-minify-css");
var minifyCss = require("gulp-clean-css");
var uglify = require("gulp-uglify");
var bowerInstall = require("gulp-bower");
var filter = require('gulp-filter');
var notify = require('gulp-notify');
var watch = require('gulp-watch');
var chmod = require('gulp-chmod');
var shell = require('gulp-shell');
var through = require('through');
var slash = require('slash');

var isRelease = process.env.NODE_ENV && process.env.NODE_ENV !== 'Debug';
var outputFolder = isRelease ? config.releaseFolder : config.debugFolder;

var manifestObj = {};

function addToManifest(bundleName, files) {
    var resultFiles = [];
    if (files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            resultFiles.push(file.path);
        }
    }

    if (manifestObj[bundleName] && typeof manifestObj[bundleName].push === 'function') {
        for (var i = 0; i < resultFiles.length; i++) {
            manifestObj[bundleName].push(resultFiles[i]);
        }
    }
    else {
        manifestObj[bundleName] = resultFiles;
    }

}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function buildImporter(filename, relativePath) {
    var contents = [];
    var lineBreak = '\n';

    function write(file) {
        if (file.isNull()) return;
        if (file.isStream()) return this.emit('error', new gutil.PluginError('buildImporter', 'Streaming not supported'));
        file.base = outputFolder;

        var filePath = ((relativePath || '').replace(/([^\/])$/, "$1/") || '') + encodeURI(slash(file.relative));
        filePath = filePath.replace(new RegExp("^" + escapeRegExp(outputFolder)), './');
        if (filePath && filePath.trim()) {
            var importString = 'import \'';
            importString += filePath;
            importString += '\';';
            contents.push(importString);
        }

    }
    function end() {
        var cwd = process.cwd();
        var manifestFile = new gutil.File({
            cwd: cwd,
            base: cwd,
            path: path.join(cwd, filename),
            contents: new Buffer(contents.join(lineBreak))
        });
        this.emit('data', manifestFile);
        this.emit('end');
    }

    return through(write, end);
}

function getManifest(baseFolder, includeRelativePath, pathPrepend) {
    var fs = require("fs");
    try {
        fs.statSync(baseFolder);
    } catch (err) {
        if (err.code === 'ENOENT') {
            fs.mkdirSync(baseFolder);
        } else {
            throw err;
        }
    }

    //var baseStream = mergeStream();
    var bundle = manifestObj[config.bundleNames.scriptsApplication]
        .concat([path.join(outputFolder, 'templates.js')])
        .filter(function (name) { return !name.match(/(\/|\\){1}app.js$/); }); //

    // Determine filename ("./build/manifest-debug.json" or "./build/manifest-release.json"
    var manifestFile = baseFolder + "importer.ts";
    var newStream = gulp
        .src(bundle)
        .pipe(buildImporter("importer.ts", outputFolder))
        .pipe(gulp.dest(outputFolder))
        ;

    return newStream;
}

gulp.task('clear', function () {
    clear();
});

// Delete the build folder
gulp.task("clean-debug", [], function (cb) {
    return del([outputFolder], cb);
});

// Delete the release folder
gulp.task("clean-release", [], function (cb) {
    return del([config.releaseFolder], cb);
});

gulp.task("clean", ["clean-debug", "clean-release"]);

gulp.task('clean-assets', [], function (cb) {
    return del([outputFolder + "assets"], cb);
});
gulp.task('clean-scripts', [], function (cb) {
    return del([outputFolder + "!template.js"], cb);
});
gulp.task('clean-html', [], function (cb) {
    return del([outputFolder + "templates.js"], cb);
});
gulp.task('clean-appNext', [], function (cb) {
    return del([outputFolder + config.bundleNames.appNext], cb);
});

// Load assets after styles -> to pull in any other assets
var otherAssetsToMove = [];
gulp.task("assets", [/*"styles", "styles-print"*/], function () {
    return gulp
        .src(['./src/**/*.*'].concat(otherAssetsToMove), {
            base: "./src/assets"
        })
        .pipe(chmod({ read: true, write: true }))
        .pipe(gulp.dest(outputFolder + '/assets'));
});

var applicationScripts = [].concat.apply([], config.scriptLoadOrderApplication.map(function (val, ind, arr) {
    return config.scripts[val];
}));

gulp.task('lint', [], function () {
    return gulp
        .src(applicationScripts)
        .pipe(cached('jshint'))
        .pipe(jshint({
            maxerr: 1000
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(notify(function (file) {
            if (file.jshint.success) {
                // Don't show something if success
                return false;
            }

            var errors = file.jshint.results.map(function (data) {
                if (data.error) {
                    return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
                }
            }).join("\n");
            return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
        }))
        .pipe(jshint.reporter("fail").on('error', function (error) {
            if (error && error.message) {
                var dirtyErrors = error.message.replace('JSHint failed for:', '').trim().split(',');
                var cleanErrors = [];

                for (var i = 0; i < dirtyErrors.length; i++) {
                    var errorPath = dirtyErrors[i].trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    cleanErrors.push(new RegExp(errorPath));
                }

                for (var k in cached.caches['jshint']) {
                    var shouldRemoveFromCache = false;

                    for (var i = 0; i < cleanErrors.length; i++) {
                        if (cleanErrors[i].test(k)) {
                            shouldRemoveFromCache = true;
                            break;
                        }
                    }

                    if (shouldRemoveFromCache) {
                        cached.caches['jshint'][k] = null;
                        //console.log('Removing ' + k + ' from cache!');
                    }
                    //console.log(k + '\n');
                }
            }

        }));
});


gulp.task('scripts', ['clean-scripts'], function () { //, 'lint'
    return gulp
        .src(applicationScripts, {
            base: config.base
        })
        .pipe(ignore.exclude(config.ignoreExtensions))
        // .pipe(gulpif(isRelease, concat('app.js', {
        //     newLine: ';'
        // })))
        //    .pipe(gulpif(isRelease, rev()))
        //    .pipe(gulpif(isRelease, uglify()))
        .pipe(gulpif(isRelease, chmod({ read: true, write: true })))
        .pipe(gulp.dest(outputFolder))
        .pipe(gutil.buffer(function (err, files) {
            addToManifest(config.bundleNames.scriptsApplication, files);
        }))
        ;
});


gulp.task('html', function () { //["clean-html"],
    return gulp.src(config.htmlPaths)
        .pipe(rename(function (pathToFile) {
            pathToFile.dirname = path.join('./Phoenix', pathToFile.dirname);
        }))
        .pipe(templateCache({
            module: "Phoenix",
            transformUrl: function (url) {
                return "/" + url;
            }
        }))
        // .pipe(gulpif(isRelease, rev()))
        // .pipe(gulpif(isRelease, uglify()))
        .pipe(chmod({ read: true, write: true }))
        .pipe(gulp.dest(outputFolder))
        .pipe(gutil.buffer(function (err, files) {
            addToManifest(config.bundleNames.htmlTemplates, files);
        }))
        ;
});

gulp.task('build-manifest', function () {
    return getManifest(outputFolder, true);
});

//
gulp.task('build', function (callback) {
    return runSequence('clean', ['scripts', 'assets', 'html'], 'build-manifest', callback);  // 'lint', 
});

gulp.task('watch', ['clear', 'build'], function () {

    watch(applicationScripts, function (event) {
        return runSequence('clear', 'scripts');
    });

    watch(config.htmlPaths, function (event) {
        return runSequence('html');
    });
});

gulp.task('watch:only', function () {

    watch(applicationScripts, function (event) {
        return runSequence('clear', 'scripts');
    });

    watch(config.htmlPaths, function (event) {
        return runSequence('html');
    });
})

// External trigger for release
gulp.task('release', function () {
    isRelease = true;
    outputFolder = config.releaseFolder;
    return runSequence('build');
});

gulp.task('default', (process.env.NODE_ENV && process.env.NODE_ENV !== 'Debug') ? ["release"] : null); //['build']