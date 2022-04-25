var gulp = require("gulp");
var connect = require("gulp-connect");

var minifyHtml = require("gulp-minify-html"); //压缩html

var rename = require("gulp-rename"); //重命名
var scssToCss  = require("gulp-sass")(require('sass')); //scss to css
var minifyCss = require("gulp-minify-css"); //压缩CSS
var autoprefixer = require("gulp-autoprefixer");

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
  gulp.watch("src/static/scss/*.scss", gulp.series(
    "scss",
    gulp.parallel("css"),
    gulp.parallel("connect")
  ));
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    "scss",
    gulp.parallel("html", "css"),
    gulp.parallel("connect", "watchs")
  )
);

gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel("html", "css")
  )
);
