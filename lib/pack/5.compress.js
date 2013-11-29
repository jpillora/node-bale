

  function zipPackage() {
    tar(TMP_DIR, outputFile, function(err) {
      if(err)console.error('tar error:',err);
      cleanup();
    });
  }

  function cleanup() {
    rimraf.sync(path.join(TMP_DIR,'..'));
    callback(null, 'done');
  }

module.exports = function(callback) {
};