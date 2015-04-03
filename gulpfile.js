var gulp = require('gulp')
  , map = require('map-stream')
  , maxmin = require('maxmin')
  , uglify = require('gulp-uglify');

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

var size = new Size('qvd');

gulp.task('build', function (done) {
  gulp.src(['index.js'])
    .pipe(map(function (file, fn) {
      file.contents = new Buffer([
        "define(['module'], function (module) {",
        file.contents.toString(),
        '})'
      ].join('\n'));
      fn(null, file);
    }))
    .pipe(size.max())
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      done();
    });
});

gulp.task('uglify', ['build'], function (done) {
  gulp.src(['dist/index.js'])
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

gulp.task('default', ['uglify']);