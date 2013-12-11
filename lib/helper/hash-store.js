
var crypto = require('crypto');

function HashStore(debug) {
  this.debug = debug;
  this.ids = {};
  this.hashes = {};
  this.objs = [];
}

HashStore.prototype.add = function(id, obj) {

  if(this.ids[id])
    throw new Error("already inserted: " + id);

  this.salt = crypto.randomBytes(8).toString('base64');

  obj.id = id;
  var hash = this.hash(id);
  obj.hash = hash;

  if(this.objs.indexOf(obj) === -1)
    this.objs.push(obj);
  
  this.ids[id] = obj;
  this.hashes[hash] = obj;
  
  return true;
};

HashStore.prototype.get = function(idOrHash) {
  return this.ids[idOrHash] || this.hashes[idOrHash];
};

HashStore.prototype.hash = function(id) {
  
  if(this.debug === true)
    return id;
  else if(typeof this.debug === 'function')
    return this.debug(id);

  var h = crypto.createHash('sha1');
  h.update(this.salt + "|" + id);
  
  //create js identifier
  return h.digest('base64').
    replace(/\W/g,''). //remove /+=
    replace(/^\d+/,''); //remove leading digits
};

//proxy some objs array methods
['forEach', 'map', 'filter'].forEach(function(fnName) {
  HashStore.prototype[fnName] = function(fn) {
    return this.objs[fnName](fn);
  };
});

HashStore.prototype.compress = function() {
  var compress = this._compressHash.bind(this);
  this.forEach(compress);
};

HashStore.prototype._compressHash = function(obj) {
  var chars = 1, curr, found;
  do {
    found = false;
    curr = obj.hash.substr(0, chars++);
    for(var id in this.ids) {
      var o = this.ids[id];
      if(o === obj) continue;
      if(o.hash.indexOf(curr) === 0) {
        found = true;
        break;
      }
    }
  } while(found);
  obj.hash = curr;
};

module.exports = HashStore;