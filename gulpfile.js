var browserify = require('browserify');
var fs = require('fs');
var gulp = require('gulp');
var buffer = require('gulp-buffer');
var header = require('gulp-header');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var strftime = require('strftime');
var bower = require('gulp-bower');

var version = require('./package.json').version;
var date = strftime('%F');
// ------------------------------------------------------------------
/* Main gulp task to minify and concat assets */
gulp.task('dist', function () {
    var bundleStream = browserify('./js/isoworld.js').bundle({
        standalone: 'isoworld'
    });

    var banner = fs.readFileSync('./js/banner/copyright.js');
    var bannerMin = fs.readFileSync('./js/banner/copyright.min.js');
    var opts = {
        date: date,
        version: version
    };

    bundleStream
        .pipe(source('isoworld.js'))
        .pipe(buffer())
        .pipe(header(banner, opts))
        .pipe(gulp.dest('./dist'))

        .pipe(uglify())
        .pipe(header(bannerMin, opts))
        .pipe(rename('isoworld.min.js'))
        .pipe(gulp.dest('./dist'))

});
// ------------------------------------------------------------------
gulp.task('default', ['dist', 'watch']);
// ------------------------------------------------------------------
gulp.task('bower', function() {
    bower();
});
// ------------------------------------------------------------------
gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['dist']);
});
// ------------------------------------------------------------------
// ------------------------------------------------------------------
