var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var browserSync = require('browser-sync').create();

var filesCSS = [  
  'www/modules/login/login.scss',
  'www/modules/menu-tabs/menu.scss',
  'www/modules/lista-customer/lista-customer.scss',
  'www/modules/customers/customers.scss'
]

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['devCSS', 'watch'],
  bSync => {
    browserSync.init({
      server: './www'
    });

    gulp.watch("www/*.html").on('change', browserSync.reload);
    
  });

// gulp.task('sass', function(done) {
//   gulp.src('./scss/ionic.app.scss')
//     .pipe(sass())
//     .on('error', sass.logError)
//     .pipe(gulp.dest('./www/css/'))
//     .pipe(minifyCss({
//       keepSpecialComments: 0
//     }))
//     .pipe(rename({ extname: '.min.css' }))
//     .pipe(gulp.dest('./www/css/'))
//     .on('end', done);
// });

gulp.task('devCSS', function () {
  return gulp.src(filesCSS)
      .pipe(concat('main.min.css'))
      .pipe(sass())
      .pipe(gulp.dest('./www/content/css/'))
      .pipe(browserSync.stream());
});

// gulp.task('watch', ['sass'], function() {
//   gulp.watch(paths.sass, ['sass']);
// });

gulp.task('watch', function() {
  gulp.watch(filesCSS, ['devCSS']);
})

// gulp.task('install', ['git-check'], function() {
//   return bower.commands.install()
//     .on('log', function(data) {
//       gutil.log('bower', gutil.colors.cyan(data.id), data.message);
//     });
// });

// gulp.task('git-check', function(done) {
//   if (!sh.which('git')) {
//     console.log(
//       '  ' + gutil.colors.red('Git is not installed.'),
//       '\n  Git, the version control system, is required to download Ionic.',
//       '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
//       '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
//     );
//     process.exit(1);
//   }
//   done();
// });
