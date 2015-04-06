var gulp = require('gulp')
  , map = require('map-stream')
  , maxmin = require('maxmin')
  , uglify = require('gulp-uglify')
  , webpack = require('gulp-webpack')
  , config = require('./webpack.config');

function Size(name) {
  this._name = name;
  this._max = undefined;
  this._min = undefined;
}
Size.prototype.max = function () {
  var self = this;
  return map(function (file, cb) {
    self._max = file.contents;
    cb(null, file);
  });
};
Size.prototype.min = function (rename) {
  var self = this;
  return map(function (file, cb) {
    self._min = file.contents;
    rename &&
      (file.path = rename(file.path));
    cb(null, file);
  });
};
Size.prototype.print = function () {
  var self = this;
  setTimeout(function () {
    console.log(self._name, maxmin(self._max, self._min, true));
  }, 0);
}

var size = new Size('vd.js')
  , allSize = new Size('all.js');

gulp.task('vd-build', function (done) {
  gulp.src(['vd.js'])
    .pipe(webpack(config.vd))
    .pipe(size.max())
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      done();
    });
});

gulp.task('vd-uglify', ['vd-build'], function (done) {
  gulp.src(['dist/vd.js'])
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(size.min(function (path) {
      return path.replace(/\.js$/, '.min.js');
    }))
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      size.print();
      done();
    })
});

gulp.task('all-build', function (done) {
  gulp.src(['index.js'])
    .pipe(webpack(config.all))
    .pipe(allSize.max())
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      done();
    });
});

gulp.task('all-uglify', ['all-build'], function (done) {
  gulp.src(['dist/all.js'])
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(allSize.min(function (path) {
      return path.replace(/\.js$/, '.min.js');
    }))
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      allSize.print();
      done();
    })
});

gulp.task('default', ['vd-uglify', 'all-uglify']);