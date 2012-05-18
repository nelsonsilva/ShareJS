var Mustache, fs, template;

fs = require('fs');

Mustache = (function() {
  try {
    return require('mustache');
  } catch (e) {
    return {
      to_html: function() {
        return "<body><pre>% npm install mustache</pre> to use this demo.";
      }
    };
  }
})();

template = fs.readFileSync("" + __dirname + "/template.html.mu", 'utf8');

module.exports = function(docName, model, res, next) {
  return model.getSnapshot(docName, function(error, data) {
    var html;
    if (data === null) {
      return next();
    } else {
      html = Mustache.to_html(template, {
        content: data.snapshot,
        docName: docName
      });
      res.writeHead(200, {
        'content-type': 'text/html'
      });
      return res.end(html);
    }
  });
};
