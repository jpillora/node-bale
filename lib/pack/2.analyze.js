module.exports = function(callback) {

  //===========================
  // KICK OFF

  mdeps(entryFile, {
      filter: function filterModules(name) {
        //skip core
        if(resolve.isCore(name)) return false;

        //include file paths
        if(/^\.?\//.test(name)) return true;

        var id = this.resolveId(this.entryDir, name);
        return !this.externals[id];
      }.bind(this)
    }).
    on('data',
      function categorizeModule(m) {
        m.basename = path.basename(m.id);
        m.dir = path.dirname(m.id);
        m.hash = hashId(m.id);
        this.hashes.push(m.hash);
        m.params = {};
        m.args = [];
        this.modules[m.id] = m;
      }.bind(this)
    ).
    on('end', callback);

};