import browserify from 'browserify';
import browserSync from 'browser-sync';
import gulp from 'gulp';
import notifier from 'node-notifier';
import path from 'path';
import source from 'vinyl-source-stream';
import exorcist from 'exorcist';
import transform from 'vinyl-transform';
import watchify from 'watchify';
import livereactload from 'livereactload';

global.$ = require("gulp-load-plugins")();

// eslint "no-process-env":0
//noinspection JSUnresolvedVariable
const production = $.util.env.prod || process.env.NODE_ENV === 'production';

const config = require('./package.json').build;

const browserifyConfig = {
    entries:      [config.scripts.source],
    extensions:   config.scripts.extensions,
    debug:        !production,
    cache:        {},
    packageCache: {}
};

function handleError(err) {
    $.util.log(err.message);
    $.util.beep();

    notifier.notify({
        title:   'Compile Error',
        message: err.message
    });

    return this.emit('end');
}

gulp.task('scripts', () => {
    let pipeline = browserify(browserifyConfig)
        .bundle()
        .on('error', handleError)
        .pipe(source(config.scripts.filename));

    if (production) {
        pipeline = pipeline
            .pipe($.streamify($.uglify()))
            .pipe($.streamify($.rev()));
    } else {
        pipeline = pipeline.pipe(transform(() => {
            return exorcist(path.join(config.scripts.destination, config.scripts.filename) + '.map');
        }));
    }

    return pipeline.pipe(gulp.dest(config.scripts.destination));
});

gulp.task('templates', ['styles', 'scripts'], () => {
    const resources = gulp.src(config.inject.resources, {read: false});

    const pipeline = gulp.src(config.templates.source)
        .pipe($.jade({
            pretty: !production
        }))
        .on('error', handleError)
        .pipe($.inject(resources, {ignorePath: 'public', removeTags: true}))
        .pipe(gulp.dest(config.templates.destination));

    if (production) {
        return pipeline;
    }

    return pipeline.pipe(browserSync.reload({
        stream: true
    }));
});

/*
 * LESS -> CSS
 * Takes all .less files from src, compiles them separately and then merges them into one file
 */

gulp.task('styles', () => {
    let pipeline = gulp.src(config.styles.source);

    if (!production) {
        pipeline = pipeline.pipe($.sourcemaps.init());
    }

    pipeline = pipeline.pipe($.less())
        .on('error', handleError)
        .pipe($.autoprefixer(config.styles.browserVersions))
        //TODO: csso
        .pipe($.concat(config.styles.filename));

    if (production) {
        pipeline = pipeline.pipe($.rev());
    } else {
        pipeline = pipeline.pipe($.sourcemaps.write('.'));
    }

    pipeline = pipeline.pipe(gulp.dest(config.styles.destination));

    if (production) {
        return pipeline;
    }

    return pipeline.pipe(browserSync.stream({
        match: '**/*.css'
    }));
});

gulp.task('assets', () => {
    return gulp.src(config.assets.source)
        .pipe(gulp.dest(config.assets.destination));
});

gulp.task('server', () => {
    return browserSync({
        open:      false,
        port:      9001,
        notify:    false,
        ghostMode: false,
        server:    {
            baseDir: config.destination
        }
    });
});

gulp.task('watch', () => {
    ['templates', 'styles', 'assets'].forEach((watched) => {
        $.watch(config[watched].watch, () => {
            gulp.start(watched);
        });
    });

    const bundle = watchify(browserify(browserifyConfig).plugin(livereactload));

    bundle.on('update', () => {
        const build = bundle.bundle()
            .on('error', handleError)
            .pipe(source(config.scripts.filename));

        build
            .pipe(gulp.dest(config.scripts.destination))
            .pipe($.duration('Rebundling browserify bundle'));
    }).emit('update');
});

gulp.task('build', ['styles', 'assets', 'scripts', 'templates']);
gulp.task('default', ['styles', 'assets', 'templates', 'watch', 'server']);
