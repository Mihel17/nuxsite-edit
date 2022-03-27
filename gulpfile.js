const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const svgo = require("gulp-svgo");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const cheerio = require("gulp-cheerio");
const del = require("del");
const fileinclude = require('gulp-file-include');
const sync = require("browser-sync").create();
const uncss = require('gulp-uncss');

// Path open server

const PATH_TO_DIST = '/OpenServer/domains/about-nuxsite'

// Styles

const styles = () => {
  return gulp.src("src/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(gulp.dest(`${PATH_TO_DIST}/css`))
    .pipe(sync.stream());
}

// HTML

const php = () => {
  return gulp.src("src/*.php")
    .pipe(fileinclude())
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(rename({
      extname: ".php"
    }))
    .pipe(gulp.dest("dist"))
    .pipe(gulp.dest(PATH_TO_DIST));
}

const html = () => {
  return gulp.src("src/*.html")
    .pipe(fileinclude())
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest("dist"))
    .pipe(gulp.dest(PATH_TO_DIST));
}

// WebP

const webpOptimized = () => {
  return gulp.src("src/**/*.{jpg,png}")
    .pipe(webp({
      quality: 90,
      method: 6,
      sns: 0
    }))
    .pipe(gulp.dest("dist/img"))
    .pipe(gulp.dest(`${PATH_TO_DIST}`));
}

const createWebp = () => {
  return gulp.src("src/**/*.{jpg,png}")
    .pipe(webp({
      quality: 100,
      method: 0,
      sns: 0
    }))
    .pipe(gulp.dest("dist/img"))
    .pipe(gulp.dest(`${PATH_TO_DIST}`));
}

// Sprite

const spriteMin = () => {
  return gulp.src("src/assets/img/**/*.svg")
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(cheerio({
      run: ($) => {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(rename({
      basename: 'sprite',
      suffix: ".min",
      extname: ".svg"
    }))
    .pipe(gulp.dest("dist/img/svg"))
    .pipe(gulp.dest(`${PATH_TO_DIST}/img/svg`));
}

// Copy

const copy = (done) => {
  gulp.src([
    "src/assets/fonts/*.{woff2,woff}",
    "src/assets/favicon/**/*",
    "src/assets/img/icons/*.svg",
    "src/layout/**/*.php",
    "src/**/js/slick.min.js",
  ], {
    base: "src"
  })
    .pipe(gulp.dest("dist"))
    .pipe(gulp.dest(PATH_TO_DIST))
  done();
}

// const copy2 = (done) => {
//   gulp.src([

//   ])
//     .pipe(gulp.dest(`${PATH_TO_DIST}/js`))
//   done();
// }

// Clean

const cleanOpenServer = () => {
  return del([PATH_TO_DIST], {
    force: true
  });
};

const clean = () => {
  return del("dist");
};

// Server

const server = (done) => {
  sync.init({
    // server: {
    //   baseDir: "dist"
    // },
    proxy: 'http://about-nuxsite/',
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("./src/**/*.scss", gulp.series(styles, copy));
  gulp.watch("./src/**/*.js", gulp.series(webpackRun, copy, reload));
  gulp.watch("./src/**/*.html", gulp.series(html, copy, reload));
  gulp.watch("./src/**/*.php", gulp.series(html, copy, reload));
}

// Webpack

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const webpackRun = (done) => {
  gulp.src('./src/script.js')
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(gulp.dest('./dist/js'))
    .pipe(gulp.dest(`${PATH_TO_DIST}/js`));
  done();
}

// Build

const build = gulp.series(
  clean,
  cleanOpenServer,
  copy,
  // copyStyle,
  gulp.parallel(
    styles,
    php,
    html,
    spriteMin,
    // sprite,
    webpOptimized
  ),
  webpackRun,
);
exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  cleanOpenServer,
  copy,
  // copy2,
  // copyStyle,
  gulp.parallel(
    styles,
    php,
    spriteMin,
    // sprite,
    // svg,
    createWebp
  ),
  webpackRun,
  gulp.series(
    server,
    watcher
  )
);


