'use strict';

//node modules
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync');
const del = require('del');

//gulp modules
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const spritesmith = require('gulp.spritesmith');
const md5 = require('gulp-md5-plus');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-clean-css');
const gulpSort = require('gulp-sort');
const data = require('gulp-data');

//notification
const notify = require('gulp-notify');

//postcss
const autoprefixer = require('autoprefixer');
const urlRebase = require('postcss-url');

//svg
var svgSprite = require('gulp-svg-sprite');
var svg2png = require('gulp-svg2png');
var svgmin = require('gulp-svgmin');

//INDEX
//const uitIndex = require('gulp-nts-uit-index-helper');

const paths = {
  html_path : 'src',
  sprite_src : 'src/sprite/',
  sprite_dest : 'src/img/',
  sprite_svg : 'src/sprite_svg/',
  css_src : 'src/scss/',
  css_dest : 'src/css/',
  img_dest : 'src/img/',
};

const config = {
  browserSync: true,
  notify: true,
  urlRebase: false,
  //urlRebaseOption: {
  //  basePath: paths.img_dest,
  //  defaultUrl: 'https://~~',
  //  urlList: [{
  //    local:'sprite/',
  //    remote : 'https://~~sprite/',
  //  }, {
  //    local:'test/',
  //    remote:'https://~~sprite/'
  //  }]
  //}
  md5 : true,
  //uitIndex: true,
  //uitIndexOption: {
  //  path: [path.join(paths.html_path,'*.html'),path.join(paths.html_path,'*.php')],
  //  options:{}
  //},
  sprite_ratio: {
    png: 2,
    svg: 1,
  },
  svgToPng: true,
  autoprefixer: {
    browsers:
    ["Edge > 12", "ie >= 8", "Android > 0", "iOS > 0","ios >= 7","android >= 4","FirefoxAndroid > 0"]//모바일 옵션
    //['last 2 versions', "Edge > 0", "ie >= 9"] //pc 옵션
  }
};

function getFolders(dir) {
  let result = [];

  if (fs.statSync(dir).isDirectory()) {
    result = fs.readdirSync(dir).filter((file) => fs.statSync(path.join(dir, file)).isDirectory());
  }

  return result;
}

const globalOptions = {
  notify: !config.notify ? {} : {
    errorHandler: notify.onError((error) => {
      console.error(error.stack);
      return "Error : <%= error.message %>";
    })
  }
}

const spritePng = makeSprite;
const spriteSvg = gulp.series(makeSpriteSvg, makeSpriteSvgToPng);

const spritePngBuild = gulp.series(spritePng, md5SpritePng);
const spriteSvgBuild = gulp.series(spriteSvg, md5SpriteSvg);

const devTask = exports.dev = gulp.parallel(gulp.series(gulp.parallel(spriteSvg),devSass));
exports.build = gulp.parallel(gulp.series(gulp.parallel(spritePngBuild, spriteSvgBuild), buildSass));
exports.default = gulp.series(devTask, gulp.parallel(watch, runBrowserSync));
exports.minify = cssMinify;
exports.ftp = ftpUpload;
//exports.uit_index = gulp.parallel(runUitIndex);

function watch () {
  gulp.watch('**/*', {cwd: paths.css_src}, devSass);
  gulp.watch('**/*', {cwd: paths.sprite_src}, spritePng);
  gulp.watch('**/*', {cwd: paths.sprite_svg}, spriteSvg);
}

function makeSprite () {
  let folders = getFolders(paths.sprite_src);
  var options = {
    spritesmith: (options) => {
      const { folder, paths, config } = options;

      return {
        imgPath: path.posix.relative(paths.css_dest, path.posix.join(paths.sprite_dest, 'sp_' + folder + '.png')),
        imgName: 'sp_' + folder + '.png',
        cssName: path.posix.relative(paths.sprite_dest, path.posix.join(paths.css_src, 'sprite','_sp_' + folder + '.png')),
        cssFormat: 'scss',
        padding: 4,
        cssTemplate: './gulpcnf/sprite_template.hbs',
        cssSpritesheetName: 'sp_' + folder,
        cssHandlebarsHelpers: {
          sprite_ratio: config.sprite_ratio.png
        }
      }
    },
  };

  const promiseList = folders.map((folder) => {
    return new Promise(function(resolve) {
      gulp.src(path.join(paths.sprite_src, folder, '*.png'))
        .pipe(plumber(globalOptions.notify))
        .pipe(gulpSort())
        .pipe(spritesmith(options.spritesmith({folder, path, config})))
        .pipe(gulp.dest(paths.sprite_dest))
        .on('end',resolve);
    });
  });

  promiseList.push(makeSpriteMap(folders));

  return Promise.all(promiseList);
}

function makeSpriteMap(folders) {
  var options = {
    maps: {
      handlebars: {
        prefix: 'sp_',
        path: path.posix.relative(path.posix.join(paths.css_src, 'import'),path.posix.join(paths.css_src, 'sprite')),
        import: folders,
      }
    },
  };

  return new Promise(function(resolve) {
    gulp.src('gulpconf/sprite_maps_template.hbs')
      .pipe(plumber(globalOptions.notify))
      .pipe(handlebars(options.maps.handlebars))
      .pipe(rename('_sprite_maps.scss'))
      .pipe(gulp.dest(path.join(paths.css_src, 'import')))
      .on('end', resolve);
  });
}

function makeSpriteSvg () {
  var options = {
    svgSprite: (options) => {
      const { folder, paths, config } = options;

      return {
        shape: {
          spacing: {
            padding: 4
          }
        },
        mode: {
          css: {
            dest: './',
            bust: false,
            sprite: 'sp_' + folder + '.svg',
            render: {
              scss: {
                template: 'gulpconf/sprite_svg_template.hbs',
                dest: path.posix.relative(paths.sprite_dest, path.posix.join(path.css_src, 'sprite', '_sp_'+folder+'.svg'))
              }
            }
          }
        },
        variables: {
          spriteSheetName: folder,
          baseName: path.posix.relative(paths.css_src, paths.sprite_dest) + '/sp_' + folder,
          sprite_ratio: config.sprite_ratio.svg,
          svgToPng: config.svgToPng
        }
      }
    }
  }

  const folders = getFolders(paths.sprite_svg);
  const promiseList = folders.map((folder) => {
    return new Promise((resolve) => {
      gulp.src(path.join(paths.sprite_svg,folder,'*.svg'))
        .pipe(gulpSort())
        .pipe(svgSprite(options.svgSprite({ folder, paths, config })))
        .pipe(gulp.dest(paths.sprite_dest))
        .on('end', resolve);
    });
  });

  promiseList.push(makeSpriteMapSvg(folders))

  return Promise.all(promiseList);
}

function makeSpriteMapSvg (folders) {
  var options = {
    maps: {
      handlebars: {
        prefix: 'sp_',
        exe: 'scss',
        path: path.posix.relative(path.posix.join(paths.css_src, 'import'),path.posix.join(paths.css_src, 'sprite')),
        import: folders
      }
    },
  };

  return new Promise(function(resolve) {
    gulp.src('gulpconf/sprite_svg_maps_template.hbs')
      .pipe(plumber(globalOptions.notify))
      .pipe(handlebars(options.maps.handlebars))
      .pipe(rename('_sprite_svg_maps.scss'))
      .pipe(gulp.dest(path.join(paths.css_src, 'import')))
      .on('end', resolve);
  });
}

function makeSpriteSvgToPng (cb) {
  if (!config.svgToPng) return cb();

  const folders = getFolders(paths.sprite_svg);
  const sprite_list = folders.map((value) => {
    return path.join(paths.sprite_dest, 'sp_' + value + '.svg')
  });

  if (sprite_list.length === 0) return cb();

    return gulp.src(sprite_list)
    .pipe(svgmin())
    .pipe(svg2png())
    .pipe(data(makeUnixPng))
    .pipe(gulp.dest('./'));
}

function makeUnixPng (file, cb) {
  let offset = Buffer([137, 80, 78 ,71, 13, 10, 26, 10]).length;

  for (;offset < file.contents.length;) {
    let rawLength = file.contents.slice(offset, offset+=4);
    let length = rawLength.readUInt32BE(0);
    let rawType = file.contents.slice(offset, offset+=4);
    let type = rawType.toString();

    if (type === 'pHYs') {
      let rawData = file.contents.slice(offset, offset+9);
      let x = rawData.slice(0, 4).readUInt32BE(0);
      let y = rawData.slice(4, 8).readUInt32BE(0);

      if (x !== 2835 || y !== 2835) {
        file.contents.writeUInt32BE(2835, offset);
        file.contents.writeUInt32BE(2835, offset+4);
        file.contents.writeUInt8(1, offset+8);
        file.contents.writeUInt32BE(0x009a9c18, offset+9);
      }
      break;
    } else if (type === 'IEND') {
      break;
    } else {
      offset +=length+4;
    }
  }

  cb(null, file);
}

function devSass () {
  let gulpPipe = gulp.src('src/scss/**/*.scss', {sourcemaps: true})
    .pipe(plumber(globalOptions.notify))

  gulpPipe = sassPipe(gulpPipe);

  return gulpPipe
  .pipe(gulp.dest('src/css', {sourcemaps: '.'}))
  .pipe(gulpif(config.browserSync, browserSync.stream({match:'**/*.css'})));
}

function buildSass () {
  return Promise.all([
    del(path.join(paths.css_dest, '**/*.css.map')),
    new Promise(function(resolve) {
      let gulpPipe = gulp.src(path.join(paths.css_src, '**/*.scss'))
        .pipe(plumber(globalOptions.notify));

      gulpPipe = sassPipe(gulpPipe, true);

      gulpPipe
        .pipe(gulp.dest(paths.css_dest))
        .on('end',resolve);
    })
  ]);
}

function cssMinify () {
  var options = {
    cleanCSS: {
      'advanced': false,           //속성 병합 false
      'aggressiveMerging': false,  //속성 병합 false
      'restructuring': false,      //선택자의 순서 변경 false
      'mediaMerging': true,        //media query 병합 false
      'compatibility': 'ie7,ie8,*' //ie 핵 남김
    }
  };
  return gulp.src(path.join(paths.css_dest, '*.css'))
    .pipe(cleanCSS(options.cleanCSS))
    .pipe(gulp.dest('.'));
}

function runBrowserSync (cb) {
  var options = {
    browserSync: {
      server: {
        baseDir: paths.html_path,
        directory: true
      },
      open: 'external',
    },
  };

  if (config.browserSync) {
    browserSync.init(options.browserSync);
    gulp.watch(paths.html_path+'/*.html').on('change',browserSync.reload);
  } else {
    cb(null);
  }
}

function ftpUpload () {
  var options = {
    ftp: {
      host: 'view.ui.naver.com',
      port: '2001',
      useKeyfile: '.ftppass',
      userKey: 'key1',
      parallel: 10, //병렬 전송 갯수 (기본값 3, 10이상 효과 미비)
      remotePath: '',
      log: true,
    },
    //targetGlob: [path.join(paths.html_path,'**/*'), '!'+paths.sprite_src, '!'+path.join(paths.sprite_src, '**/*', '!'+paths.css...)]
  };

  try {
    var chkFtppass = fs.accessSync('.ftppass','r');
  } catch(e) {
    console.log('Not Exist .ftppass file. Please make .ftppass');
    return;
  }
  if(!options.ftp.remotePath || options.ftp.remotePath === '/') {
    console.log('remotePath not set or set root');
    return;
  }

  var conn = ftp.create(vfb(options.ftp));

  return gulp.src(options.targetGlob, {buffer: false})
    .pipe(plumber(globalOptions.notify))
    .pipe(conn.dest(conn.config.finalRemotePath));
}

//function runUitIndex (cb) {
//  if (!config.uitIndex) return cb();
//
//  return gulp.src(config.uitIndexOption.path)
//    .pipe(uitIndex(config.uitIndexOption.options))
//    .pipe(gulp.dest('src/'));
//}

function md5SpritePng (cb) {
  var options = {
    md5: {
      cssSrc: path.join(paths.css_src,'sprite/*.scss'), //이름 변경 대상 css(scss) 파일
      srcDel: false,  //sprite 이름 변경전 파일 삭제 여부
      logDel: true,  //이전 생성된 md5 sprite 삭제 여부
    }
  }

  if(config.md5) {
    var del_sprite = [];
    var sprite_list = getFolders(paths.sprite_src);
    if (!sprite_list.length) return cb();

    for(var i=0,imax=sprite_list;i < imax;i++) {
      del_sprite.push(path.join(paths.sprite_dest,'sp_' + sprite_list[i] + '_????????.png'));
      sprite_list[i] = path.join(paths.sprite_dest, 'sp_' + sprite_liist[i] + '.png');
    }

    return del(del_sprite)
    .then(function() {
      return new Promise(function(resolve) {
        gulp.src(sprite_list)
        .pipe(plumber(globalOptions.notify))
        .pipe(md5(8,options.md5.cssSrc))
        .pipe(gulp.dest(paths.sprite_dest))
        .on('end',resolve);
      });
    }).then(function() {
      if(options.md5.srcDel) {
        return del(sprite_list)
      }
    });
  }
}

function md5SpriteSvg (cb) {
  var options = {
    md5: {
      cssSrc: path.join(paths.css_src,'sprite/*.scss'), //이름 변경 대상 css(scss)파일
      srcDel: false, //sprite 이름 변경전 파일 삭제 여부
      logDel: true, //이전 생성된 md5 sprite 삭제 여부
    }
  }

  if(config.md5) {
    var del_sprite = [];
    var sprite_list = getFolders(paths.sprite_svg);
    var target_list = [];

    if (!sprite_list.length) return cb();

    for(var i=0,imax=sprite_list.length;i < imax;i++) {
      del_sprite.push(path.join(paths.sprite_dest,'sp_' + sprite_list[i] + '_????????.png'));
      del_sprite.push(path.join(paths.sprite_dest,'sp_' + sprite_list[i] + '_????????.svg'));
      target_list.push(path.join(paths.sprite_dest,'sp_' + sprite_list[i] + '.png'));
      target_list.push(path.join(paths.sprite_dest,'sp_' + sprite_list[i] + '.svg'));
    }
    return del(del_sprite)
    .then(function() {
      return new Promise(function(resolve) {
        gulp.src(target_list)
        .pipe(plumber(globalOptions.notify))
        .pipe(md5(8,options.md5.cssSrc))
        .pipe(gulp.dest(paths.sprite_dest))
        .on('end',resolve);
      });
    }).then(function() {
      if(options.md5.srcDel) {
        return del(target_list);
      }
    });
  }
}

function sassPipe(gulpPipe, build) {
  const autopreFixerOption = {
    browsers: config.autoprefixer.browsers
  };

  const ignoreWebkitBoxOrient = (root) => root.walkDecls('-webkit-box-orient', (decl) => decl.before(`${decl.raws.before}`))

  let options = {
    sass: {
      outputStyle: 'expanded',
      indentType: 'tab',
      indentWidth: 1
    },
    autoprefixer: autopreFixerOption,
    postcss: [ignoreWebkitBoxOrient, autoprefixer(autopreFixerOption)]
  };

  const urlRebaseProcess = (options) => {
    const { asset, basePath } = options;

    if (!config.urlRebaseOption.urlList) config.urlRebaseOption.urlList = [];

    const findPath = config.urlRebaseOption.urlList.find((value) => {
      const reBasePath = path.posix.join(basePath, value.local);
      return asset.url.indexOf(reBasePath) === 0;
    });

    if (findPath) {
      return findPath.remote + path.posix.relative(path.posix.join(basePath, findPath.local), asset.url);
    } else if (asset.url.indexOf(basePath) == 0) {
      return config.urlRebaseoption.defaultUrl + path.posix.relative(basePath, asset.url);
    } else {
      return asset.url;
    }
  }

  if(build && config.urlRebase) {
    options.postcss.push(urlRebase({
      basePath: path.relative(paths.css_dest,config.urlRebaseOption.basePath),
      url: (asset) => {
        let basePath = path.posix.relative(paths.css_dest, config.urlRebaseOption.basePath);
        return urlRebaseProcess({ asset, basePath })
      }
    }));
  }

  gulpPipe = gulpPipe.pipe(sass.sync(options.sass));
  gulpPipe = gulpPipe.pipe(postcss(options.postcss));
  if (build) {
    gulpPipe = gulpPipe.pipe(postcss(options.postcss));
  }

  return gulpPipe;
}

//gulp.task('uit_index',function(){
//  gulp.src(['*.html','*.css']) // 인덱스
//  .pipe(uitIndex({ //옵션 설정.
//    filename: '@index',
//    title: '마크업 산출물',
//    exJs: false,
//    html: true,
//    qrcode: true,
//    fold: true,
//    fileSort: 'file',
//    groupSort: 'asc',
//  }))
//  .pipe(gulp.dest('../')); //인덱스 저장 경로
//});