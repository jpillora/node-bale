exports.indent = function(str, times) {
  if(!times) times = 1;
  while(--times >= 0)
    str = str.replace(/^/mg, '  ');
  return str;
};

exports.hashExtId = function(pkgDir, id) {
  if(!opts.hash)
    return rela(pkgDir).replace(/\W/g,'-').replace(/^node_modules-/,'');
  return hashId(id);
};

exports.hashId = function(path) {
  if(!opts.hash)
    return rela(path).replace(/\W/g,'-');
  var h = crypto.createHash('sha1');
  h.update(path);
  
  //create js identifier
  return h.digest('base64').
    replace(/\W/g,''). //remove /+=
    replace(/^\d+/,''); //remove leading digits
};

exports.hashCompress = function() {

  compressObj(modules);
  compressObj(externals);

  function compressObj(obj) {
    var k, v;
    for(k in obj) {
      v = obj[k];
      v.hash = compress(v.hash);
    }
  }

  function compress(fullhash) {
    var h = hashes.indexOf(fullhash);
    if(h === -1) throw "hash should be there...";

    var chars = 1, curr, found;
    do {
      found = false;
      curr = fullhash.substr(0, chars++);
      for(var i = 0; i < hashes.length; ++i) {
        if(i === h) continue;
        var hash = hashes[i];
        if(hash.indexOf(curr) === 0) {
          found = true;
          break;
        }
      }
    } while(found);

    return curr;
  }
};

exports.rela = function(target) {
  return path.relative(entryDir, target);
};
