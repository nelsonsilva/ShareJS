var Mustache, defaultContent, fs, render, showdown, template;

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

showdown = new (require('../lib/markdown/showdown').converter)();

template = fs.readFileSync("" + __dirname + "/wiki.html.mu", 'utf8');

defaultContent = function(name) {
  return "# " + name + " page\n\nThis wiki page is currently empty.\n\nYou can put some content in it with the editor on the right. As you do so, the document will update live on the left, and live for everyone else editing at the same time as you. Isn't that cool?\n\nThe text on the left is being rendered with markdown, so you can do all the usual markdown stuff like:\n\n- Bullet\n  - Points\n\n[links](http://google.com)\n\n[Go back to the main page](Main)";
};

render = function(content, name, docName, res) {
  var html, markdown;
  markdown = showdown.makeHtml(content);
  html = Mustache.to_html(template, {
    content: content,
    markdown: markdown,
    name: name,
    docName: docName
  });
  res.writeHead(200, {
    'content-type': 'text/html'
  });
  return res.end(html);
};

module.exports = function(docName, model, res) {
  var name;
  name = docName;
  docName = "wiki:" + docName;
  return model.getSnapshot(docName, function(error, data) {
    if (error === 'Document does not exist') {
      return model.create(docName, 'text', function() {
        var content;
        content = defaultContent(name);
        return model.applyOp(docName, {
          op: [
            {
              i: content,
              p: 0
            }
          ],
          v: 0
        }, function() {
          return render(content, name, docName, res);
        });
      });
    } else {
      return render(data.snapshot, name, docName, res);
    }
  });
};
