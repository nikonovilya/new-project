const gulp = require('gulp');
const { src, dest } = require('gulp');
const browsersync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const sass = require('gulp-sass');
const del = require('del');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

const path = {
  src: {
    html: './src/**/*.html',
    css: './src/sass/**/*.sass',
    img: './src/img/**/*.{jpg,png,svg,ico,webp,gif}',
    fonts: './src/fonts/**/*.{woff2,woff}',
    js: './src/js/**/*.js',
  },
  build: {
    html: './build/',
    css: './build/css',
    img: './build/img',
    fonts: './build/fonts',
    js: './build/js',
    clean: ['./build/**/*'],
  },
  watch: {
    html: './src/**/*.html',
    css: './src/sass/**/*.sass',
    img: './src/img/**/*.{jpg,png,svg,ico,webp,gif}',
    js: './src/js/**/*.js',
  },
};

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './build',
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html).pipe(dest(path.build.html)).pipe(browsersync.stream());
}

function styles() {
  return src('./src/sass/**/style.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false,
      })
    )
    .pipe(cleanCss({ level: 2 }))
    .pipe(dest(path.build.css))

    .pipe(src('./src/sass/normalize.min.css'))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
}

function images() {
  return src(path.src.img).pipe(dest(path.build.img)).pipe(browsersync.stream());
}

function scripts() {
  return src(path.src.js)
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify())
    .pipe(dest(path.build.js))
    .pipe(src('./src/js/focus-visible.js'))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function clean() {
  return del(path.build.clean, { force: true });
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], styles);
  gulp.watch([path.watch.js], scripts);
  gulp.watch([path.watch.img], images);
}

const build = gulp.series(clean, gulp.parallel(html, fonts, images, styles, scripts));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.fonts = fonts;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
