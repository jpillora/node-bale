var tar = require('./lib/helper/tar');


tar(process.argv[2], function(err) {

  console.log(err || 'no errors!')

});

