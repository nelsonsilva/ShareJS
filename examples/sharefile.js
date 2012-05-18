var argv, client, doc, filename, fs, timeout, write;

client = require('../src').client;

fs = require('fs');

argv = require('optimist').usage('Usage: $0 -d docname [--url URL] [-f filename]')["default"]('d', 'hello')["default"]('url', 'http://localhost:8000/channel').argv;

filename = argv.f || argv.d;

console.log("Opening '" + argv.d + "' at " + argv.url + ". Saving to '" + filename + "'");

timeout = null;

doc = null;

write = function() {
  if (timeout === null) {
    return timeout = setTimeout(function() {
      console.log("Saved version " + doc.version);
      fs.writeFile(filename, doc.snapshot);
      return timeout = null;
    }, 1000);
  }
};

client.open(argv.d, 'text', argv.url, function(d, error) {
  doc = d;
  console.log('Document ' + argv.d + ' open at version ' + doc.version);
  write();
  return doc.on('change', function(op) {
    return write();
  });
});
