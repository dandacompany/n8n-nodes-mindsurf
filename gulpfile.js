const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);

function copyIcons() {
  const nodeSource = 'nodes/**/*.{png,svg}';
  const nodeDestination = 'dist/nodes';
  
  return src(nodeSource).pipe(dest(nodeDestination));
}

exports.default = copyIcons;