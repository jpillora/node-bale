var path = require('path');

var Package = module.exports = function Package(id) {
  this.id = id;
  this.dir = path.dirname(id);
  this.json = null;
  this.files = {};
};

Package.prototype.add = function(file) {
  this.files[file.id] = file;

  //package json file - parse JSON
  if(file.id === this.id) {
    this.json = JSON.parse(file.contents);
  }
};

Package.prototype.toString = function() {
  return this.id;
};