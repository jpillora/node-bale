var UglifyJS = require('uglify-js');

UglifyJS.AST_Node.warn_function = function(txt) {
  console.warn(txt);
};

module.exports = function(codes, options) {

  var compress, sq, stream, toplevel;

  options = UglifyJS.defaults(options || {}, {
    warnings: false,
    mangle: {},
    compress: {}
  });

  if (typeof codes === "string")
    codes = [codes];

  toplevel = null;
  codes.forEach(function(code) {
    return toplevel = UglifyJS.parse(code, {
      filename: "?",
      toplevel: toplevel
    });
  });

  if (options.compress) {
    compress = {
      warnings: options.warnings
    };
    UglifyJS.merge(compress, options.compress);
    toplevel.figure_out_scope();
    sq = UglifyJS.Compressor(compress);
    toplevel = toplevel.transform(sq);
  }

  if (options.mangle) {
    toplevel.figure_out_scope();
    toplevel.compute_char_frequency();
    toplevel.mangle_names(options.mangle);
  }

  stream = UglifyJS.OutputStream();
  toplevel.print(stream);

  return stream.toString();
};


