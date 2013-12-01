
module.exports = function(ctx) {

  //write out to a file if specified, otherwise stdout
  if(ctx.opts.outputFile)
    ctx.bundle.writeZip(ctx.opts.outputFile);
  else
    process.stdout.write(ctx.bundle.toBuffer());

  return ctx;
};