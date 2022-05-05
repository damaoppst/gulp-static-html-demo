var gulp = require("gulp");
var connect = require("gulp-connect");

var minifyHtml = require("gulp-minify-html"); //压缩html

var rename = require("gulp-rename"); //重命名
var minifyCss = require("gulp-minify-css"); //压缩CSS
var autoprefixer = require("gulp-autoprefixer");
var scssToCss  = require("gulp-sass")(require('sass')); //scss to css

var clean = require("gulp-clean");

var fileinclude = require("gulp-file-include");

// 创建
gulp.task("connect", function () {
  connect.server({
    root: "dist", //根目录
    livereload: true, //自动更新
    port: 9909, //端口
  });
});

gulp.task("fileinclude", function () {
  // 适配page中所有文件夹下的所有html，排除src下的tpl文件夹中html
  gulp
    .src(["src/*.html", "!src/tpl/**.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("dist"));
});
gulp.task("html", function () {
  return gulp
    .src("src/*.html")
    .pipe(fileinclude()) //替换头部底部
    .pipe(minifyHtml()) //执行压缩
    .pipe(gulp.dest("dist"))
    .pipe(connect.reload());
});
gulp.task("scss", function () {
  return gulp
  .src("src/static/scss/*.scss")
  .pipe(scssToCss())//编译scss
  .pipe(gulp.dest("src/static/css/"))
});
gulp.task("css", function () {
  return gulp
    .src("src/static/css/*.css")
    .pipe(autoprefixer("last 15 version", "ie 8"))
    .pipe(rename({ suffix: "" })) //rename压缩后的文件名
    .pipe(minifyCss()) //执行压缩
    .pipe(gulp.dest("dist/static/css/"))
    .pipe(connect.reload()); //更新;
});

// 清空dist文件夹
gulp.task("clean", function () {
  return gulp.src(["dist/*"]).pipe(clean());
});

gulp.task("watchs", function () {
  gulp.watch("src/*.html", gulp.series("html"));
  gulp.watch("src/tpl/*.html", gulp.series("html"));
  gulp.watch("src/static/scss/*.scss", gulp.series(
    "scss",
    gulp.parallel("css")
  ));
  gulp.watch("src/static/js/*.js", gulp.series("script"));
  gulp.watch("gulpfile.js", gulp.series("default"));
});


var babel = require('gulp-babel');
var webpack = require('webpack-stream');
var sourceMap = require('gulp-sourcemaps');
gulp.task('script', () => {
  return gulp.src('src/static/js/*.js')
  .pipe( sourceMap.init() )
  .pipe(babel({
    presets: ['@babel/preset-env']
  }))
  .pipe(webpack({
    output: {
      filename: 'main.js'
    }
  }))
  .pipe(sourceMap.write()) 
  .pipe(gulp.dest('dist/static/js/'))
  .pipe(connect.reload()); //更新;
  });

  gulp.task("lib", function () {
    return gulp
      .src("src/static/lib/*.js")
      .pipe(gulp.dest("dist/static/lib/"))
      .pipe(connect.reload()); //更新;
  });
gulp.task(
  "default",
  gulp.series(
    "clean",
    "scss",
    gulp.parallel("html","lib","script", "css"),
    gulp.parallel("connect", "watchs")
  )
);

gulp.task(
  "build",
  gulp.series(
    "clean",
    "scss",
    gulp.parallel("html","lib","script", "css")
  )
);
