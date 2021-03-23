"use strict";

var gulp            = require("gulp"),
    gulpSass        = require("gulp-sass"),
    gulpSourcemaps  = require("gulp-sourcemaps"),
    gulpBrowserify  = require("gulp-browserify"),
    gulpSpriteSmith = require("gulp.spritesmith"),
    mergeStream     = require("merge-stream"),
    xtend           = require("xtend"),
    argv            = require("yargs").argv,
    path            = require("path"),
    rootPath        = argv.JenkinsCartridgesPath || __dirname;

/* SCSS paths */
var SCSS_PATHS = [
        {
            "wtc" : "scss/**/*.scss",
            "src" : "scss/*.scss",
            "dst" : "css"
        }
    ];

gulp.task("scss", function() {
    var streams = mergeStream();

    SCSS_PATHS.forEach(function(p) {
        var srcPath = path.join(rootPath, p.src),
            dstPath = path.join(rootPath, p.dst);

        streams.add(gulp.src(srcPath)
            .pipe(gulpSourcemaps.init())
            .pipe(gulpSass({"errLogToConsole" : true}))
            .pipe(gulpSourcemaps.write())
            .pipe(gulp.dest(dstPath)));
    });

    return streams;
});

gulp.task("watch", ["scss"], function() {
    SCSS_PATHS.forEach(function(p) {
        gulp.watch(path.join(rootPath, p.wtc), ["scss"]);
    });
});

gulp.task("default", [ "scss"]);