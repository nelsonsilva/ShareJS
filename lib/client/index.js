var Connection, hasBCSocket, hasSockJS, useSockJS;

if (typeof WEB !== "undefined" && WEB !== null) {
  hasBCSocket = window.BCSocket !== void 0;
  hasSockJS = window.SockJS !== void 0;
  if (!(hasBCSocket || hasSockJS)) {
    throw new Error('Must load socks or browserchannel before this library');
  }
  useSockJS = hasSockJS && !hasBCSocket;
} else {
  Connection = require('./connection').Connection;
}

exports.open = (function() {
  var connections, getConnection, maybeClose;
  connections = {};
  getConnection = function(origin) {
    var c, del, location, path;
    if (typeof WEB !== "undefined" && WEB !== null) {
      location = window.location;
      path = useSockJS ? 'sockjs' : 'channel';
      if (origin == null) {
        origin = "" + location.protocol + "//" + location.host + "/" + path;
      }
    }
    if (!connections[origin]) {
      c = new Connection(origin);
      del = function() {
        return delete connections[origin];
      };
      c.on('disconnecting', del);
      c.on('connect failed', del);
      connections[origin] = c;
    }
    return connections[origin];
  };
  maybeClose = function(c) {
    var doc, name, numDocs, _ref;
    numDocs = 0;
    _ref = c.docs;
    for (name in _ref) {
      doc = _ref[name];
      if (doc.state !== 'closed' || doc.autoOpen) numDocs++;
    }
    if (numDocs === 0) return c.disconnect();
  };
  return function(docName, type, origin, callback) {
    var c;
    if (typeof origin === 'function') {
      callback = origin;
      origin = null;
    }
    c = getConnection(origin);
    c.numDocs++;
    c.open(docName, type, function(error, doc) {
      if (error) {
        callback(error);
        return maybeClose(c);
      } else {
        doc.on('closed', function() {
          return maybeClose(c);
        });
        return callback(null, doc);
      }
    });
    c.on('connect failed');
    return c;
  };
})();

if (typeof WEB === "undefined" || WEB === null) {
  exports.Doc = require('./doc').Doc;
  exports.Connection = require('./connection').Connection;
}
