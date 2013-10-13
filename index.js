
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var falafel = require('falafel');
var mdeps = require('module-deps');
var builtIns = ['assert', 'buffer', 'child_process', 'cluster',
  'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'net',
  'os', 'path', 'punycode', 'querystring', 'readline', 'stream',
  'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib', 'smalloc'];

var moduleTemplate = getTemplate('module.js');
var mainTemplate = getTemplate('main.js');

module.exports = function(entryFile, callback) {

  entryFile = path.resolve(entryFile);

  var modules = [];
  mdeps(entryFile, {
    filter: function(s) { return builtIns.indexOf(s) === -1; }
  }).on('data', function(m) {
    modules.push(m);
  }).on('end', function() {

    modules.forEach(function(m) {
      m.source = falafel(m.source, function (node) {
        //convert require into an index into the modules array
        if(node.type === 'CallExpression' &&
           node.callee &&
           node.callee.type === 'Identifier' && node.callee.name === 'require' &&
           node.arguments.length === 1 &&
           node.arguments[0].type === 'Literal') {
          var dest = node.arguments[0].value;
          if(typeof dest !== 'string') return;
          if(!path.extname(dest)) dest += '.js';

          dest = path.join(path.dirname(m.id), dest);

          var req = _.find(modules, function(r) {
            return r.id === dest;
          });

          if(!req) return console.warn("WARNING: cannot find: %s", dest);
          
          node.arguments[0].update(modules.indexOf(req));
        }
      });
    });

    callback(null,
      mainTemplate.replace('//MODULES//', modules.map(function(m) {
        return moduleTemplate.replace('//SOURCE//', m.source);
      }).join(',\n'))
    );
  });
};

//===========================

function getTemplate(file) {
  return fs.readFileSync(path.join(__dirname, 'templates', file)).toString();
}


