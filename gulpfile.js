var gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', ['scripts', 'scripts-scorm', 'lint', 'styles'], function () { });

gulp.task('scripts', function () {
  var concat = require('gulp-concat');
  var stripDebug = require('gulp-strip-debug');
  var uglify = require('gulp-uglify');

  var files = [
    'assets/scripts/src/player.js',
    'assets/scripts/src/global.js'
  ];

  gulp.src(files)
    .pipe(concat('global.min.js'))
    // .pipe(stripDebug())
    // .pipe(babel({
    //   presets: ['@babel/env']
    // }))
    // .pipe(uglify())
    .pipe(gulp.dest('assets/scripts/dist'));
});

gulp.task('scripts-scorm', function () {
  var concat = require('gulp-concat');
  var stripDebug = require('gulp-strip-debug');
  var uglify = require('gulp-uglify');

  var files = [
    'assets/scripts/src/framework-scorm.js'
  ];

  gulp.src(files)
    .pipe(concat('framework-scorm.min.js'))
    .pipe(stripDebug())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('assets/scripts/dist'));
});

gulp.task('lint', function () {
  var jshint = require("gulp-jshint");

  var files = [
    'assets/scripts/src/framework.js'
  ];

  gulp.src(files)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('styles', function () {
  var concat = require('gulp-concat');
  var autoprefix = require('gulp-autoprefixer');
  var minifyCSS = require('gulp-clean-css');

  var files = [
    'assets/styles/src/global.css',
    'assets/styles/src/mobile.css',
    'assets/styles/src/fonts.css',
    'assets/styles/src/slider3d.css',
  ];

  gulp.src(files)
    .pipe(concat('global.min.css'))
    .pipe(autoprefix('last 4 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('assets/styles/dist/'));
});

gulp.task('watch', function () {
  var watch = require('gulp-watch');

  gulp.watch('assets/scripts/src/*.js', ['scripts']);
  gulp.watch('assets/scripts/src/*.js', ['scripts-scorm']);
  gulp.watch('assets/styles/src/*.css', ['styles']);
});

gulp.task('server', ['watch'], function () {
  var browserSync = require('browser-sync');

  var files = [
    '*.html',
    'assets/styles/dist/*.css',
    'assets/scripts/dist/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: './'
    }
  });
});