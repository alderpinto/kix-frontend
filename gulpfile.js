const gulp = require('gulp');
const tsc = require('gulp-tsc');
const runseq = require('run-sequence');
const clean = require('gulp-clean');
const mocha = require('gulp-mocha');
const tslint = require("gulp-tslint");
const less = require("gulp-less");
const path = require('path');

const tslintConfig = require('./tslint.json');
const orgEnv = process.env.NODE_ENV;

const devTSCConfig = {
    target: "es6",
    lib: ["es6", "dom"],
    types: ["node", "reflect-metadata"],
    module: "commonjs",
    moduleResolution: "node",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    sourceMap: true,
    declaration: true,
    strict: true
};

const prodTSCConfig = {
    target: "es6",
    lib: ["es6", "dom"],
    types: ["node", "reflect-metadata"],
    module: "commonjs",
    moduleResolution: "node",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    sourceMap: false,
    declaration: true,
    strict: true
};

gulp.task('default', (cb) => {
    runseq('tslint', 'test', 'clean', 'compile-src', 'compile-themes', 'copy-component-templates', 'copy-static', cb);
});

gulp.task('tslint', () => {
    gulp.src(['src/**/*.ts'])
        .pipe(tslint(tslintConfig))
        .pipe(tslint.report());
});

gulp.task('test', () => {
    process.env.NODE_ENV = 'test';
    return gulp.src([
        'tests/client/**/*.test.ts',
        'tests/model/**/*.test.ts',
        // 'tests/communicators/**/*.test.ts',
        'tests/services/IAuthenticationService.test.ts',
        'tests/services/IConfigurationService.test.ts',
        'tests/services/IHTTPService.test.ts',
        'tests/services/ILoggingService.test.ts',
        'tests/services/IPluginService.test.ts',
        // 'tests/services/ISocketCommunicationService.test.ts',
        'tests/services/ITicketTypeService.test.ts',
        'tests/services/IUserService.test.ts',
    ])
        .pipe(mocha({
            reporter: 'spec',
            compilers: 'ts:ts-node/register'
        }));
});

gulp.task('clean', () => {
    process.env.NODE_ENV = orgEnv;
    return gulp
        .src(['dist', 'components'])
        .pipe(clean());
});

gulp.task('compile-src', () => {
    let config = prodTSCConfig;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log("Use tsconfig for development.")
        config = devTSCConfig;
    }

    return gulp
        .src(['src/**/*.ts'])
        .pipe(tsc(config))
        .pipe(gulp.dest('dist'));
});

gulp.task('compile-themes', () => {
    let config = prodTSCConfig;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log("Use tsconfig for development.")
        config = devTSCConfig;
    }

    return gulp
        .src(['src/static/less/themes/*.less'])
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('dist/static/themes'));
});

gulp.task('copy-component-templates', () => {
    return gulp
        .src(['src/components/**/*.marko', 'src/components/**/*.less', 'src/components/**/*.json'])
        .pipe(gulp.dest('dist/components'));
});

gulp.task('copy-static', () => {
    return gulp
        .src(['src/static/**/*'])
        .pipe(gulp.dest('dist/static'));
});
