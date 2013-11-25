/**
@module ember
@submodule ember-routing
*/

function DSL(name) {
  this.parent = name;
  this.matches = [];
}

DSL.prototype = {
  resource: function(name, options, callback) {
    if (arguments.length === 2 && typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (arguments.length === 1) {
      options = {};
    }

    if (typeof options.path !== 'string') {
      options.path = "/" + name;
    }

    if (callback) {
      var dsl = new DSL(name);
      route(dsl, 'loading');
      route(dsl, 'error', { path: "/_unused_dummy_error_path_route_" + name + "/:error" });
      callback.call(dsl);
      this.push(options.path, name, dsl.generate(), options.queryParams);
    } else {
      this.push(options.path, name, null, options.queryParams);
    }

  },

  push: function(url, name, callback, queryParams) {
    var parts = name.split('.');
    if (url === "" || url === "/" || parts[parts.length-1] === "index") { this.explicitIndex = true; }

    this.matches.push([url, name, callback, queryParams]);
  },

  route: function(name, options) {
    route(this, name, options);
  },

  generate: function() {
    var dslMatches = this.matches;

    if (!this.explicitIndex) {
      this.route("index", { path: "/" });
    }

    return function(match) {
      for (var i=0, l=dslMatches.length; i<l; i++) {
        var dslMatch = dslMatches[i];
        match(dslMatch[0]).to(dslMatch[1], dslMatch[2]);
      }
    };
  }
};

function route(dsl, name, options) {
  Ember.assert("You must use `this.resource` to nest", typeof options !== 'function');

  options = options || {};

  if (typeof options.path !== 'string') {
    options.path = "/" + name;
  }

  if (dsl.parent && dsl.parent !== 'application') {
    name = dsl.parent + "." + name;
  }

  dsl.push(options.path, name, null, options.queryParams);
}

DSL.map = function(callback) {
  var dsl = new DSL();
  callback.call(dsl);
  return dsl;
};

Ember.RouterDSL = DSL;
