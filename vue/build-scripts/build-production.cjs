const fs = require('fs')
const fse = require('fs-extra')

const removeDir = function(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(path + '/' + filename).isDirectory()) {
          removeDir(path + '/' + filename)
        } else {
          fs.unlinkSync(path + '/' + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    console.log('Directory path not found.')
  }
}

require('./prepare-files.cjs')

console.log('Start building the app...')
const execSync = require('child_process').execSync

const buildEnv = { ...process.env }
if (parseInt(process.version.match(/^v*(\d+)/)[1]) >= 17) {
  buildEnv.NODE_OPTIONS = [buildEnv.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' ')
}
execSync('npx quasar build', { env: buildEnv, stdio: 'inherit' })

const srcDir = './dist/spa'
if (fs.existsSync(srcDir)) {
  console.log('The app is built successfully')

  const destDir = '../../../adminpanel/'
  if (fs.existsSync(destDir)) {
    removeDir(destDir)
  }

  console.log('Start moving app files to the adminpanel directory...')
  fse.moveSync(srcDir, destDir) //requires fs-extra
  fs.renameSync(destDir + 'index.html', destDir + 'main.html')
  console.log('The app is now in the adminpanel directory')

  console.log('Start to create index.php...')
  const indexPhpContent = `<?php
  include_once '../system/autoload.php';

  use Aurora\\System\\Api;
  use Aurora\\System\\Application;

  // Override aurora-mobile=1 from mobile webclient (path /) so admin API uses desktop modules.
  @\\setcookie(
    \\Aurora\\System\\Managers\\Integrator::MOBILE_KEY,
    '0',
    \\strtotime('+200 days'),
    '/',
    null,
    false
  );

  if (is_array($_GET) && count($_GET) > 0) {
  \tApi::Init();
  \tApplication::setBaseUrl(\\substr(Application::getBaseUrl(), 0, -strlen(basename(__DIR__))-1));
  \tApplication::Start();
  } else {
  \tinclude_once './main.html';
  }
`
  fse.writeFileSync(destDir + 'index.php', indexPhpContent)
  console.log('Everything is ready now')
} else {
  console.log('An error occurred while building the app')
}
