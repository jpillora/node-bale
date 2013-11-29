
var fs = require('fs');
var mainTemplate = fs.readFileSync(
    path.join(__dirname, '..', 'templates', 'main.js')
  ).toString();