var Model, attach, connect, create, createDb, createModel, rest, sockjs;

connect = require('connect');

Model = require('./model');

createDb = require('./db');

rest = require('./rest');

sockjs = require('./sockjs');

module.exports = create = function(options, model) {
  if (model == null) model = createModel(options);
  return attach(connect(), options, model);
};

create.createModel = createModel = function(options) {
  var db, dbOptions;
  dbOptions = options != null ? options.db : void 0;
  db = createDb(dbOptions);
  return new Model(db, options);
};

create.attach = attach = function(server, options, model) {
  var createAgent;
  if (model == null) model = createModel(options);
  if (options == null) options = {};
  if (options.staticpath == null) options.staticpath = '/share';
  server.model = model;
  server.on('close', function() {
    return model.closeDb();
  });
  if (options.staticpath !== null) {
    server.use(options.staticpath, connect.static("" + __dirname + "/../../webclient"));
  }
  createAgent = require('./useragent')(model, options);
  if (options.rest !== null) server.use(rest(createAgent, options.rest));
  if (options.socketio != null) {
    socketio.attach(server, createAgent, options.socketio || {});
  }
  if (options.sockjs != null) {
    sockjs.attach(server, createAgent, options.sockjs || {});
  }
  if (options.browserChannel !== null) {
    console.log("browserChannel " + options.browserChannel);
    if (options.browserChannel == null) options.browserChannel = {};
    options.browserChannel.server = server;
    server.use(browserChannel(createAgent, options.browserChannel));
  }
  return server;
};
