
var defaults = {
  hash: false,
  compress: false
};

module.exports = function(callback) {

  this.TMP_DIR = path.join(__dirname,'..','tmp', crypto.randomBytes(4).toString('hex'), 'app');
  mkdirp.sync(this.TMP_DIR);

  this.opts = Object.create(defaults);

  if(arguments.length === 3) {
    callback = options;
  } else if(arguments.length === 4) {

    //extend defaults
    for(var k in defaults)
      if(this.options[k] !== undefined)
        this.opts[k] = options[k];

  } else {
    return callback('entry file [, options] and callback arguments required');
  }

  if(!this.entryFile || !fs.existsSync(this.entryFile))
    return callback('missing entry file');

  this.entryDir = path.dirname(this.entryFile);

  //file path hash => file contents
  this.modules = {};
  this.externals = {};
  this.hashes = [];

  callback(null);
};