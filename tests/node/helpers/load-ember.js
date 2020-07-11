const path = require('path');
const distPath = path.join(__dirname, '../../../dist');
const emberPath = path.join(distPath, 'tests/ember');
const templateCompilerPath = path.join(distPath, 'ember-template-compiler');

// We store the global symbols beforehand so that we can reset the state
// properly to avoid the @glimmer/validator assertion
const originalGlobalSymbols = Object.getOwnPropertySymbols(global).map(sym => [sym, global[sym]]);

module.exports.loadEmber = function() {
  let Ember = require(emberPath);

  let precompile = require(templateCompilerPath).precompile;

  let compile = function(templateString, options) {
    let templateSpec = precompile(templateString, options);
    let template = new Function('return ' + templateSpec)();

    return Ember.HTMLBars.template(template);
  };

  return { Ember, compile };
};

module.exports.clearEmber = function() {
  delete global.Ember;

  Object.getOwnPropertySymbols(global).forEach(sym => {
    delete global[sym];
  });

  originalGlobalSymbols.forEach(([sym, value]) => {
    global[sym] = value;
  });

  // clear the previously cached version of this module
  delete require.cache[emberPath + '.js'];
  delete require.cache[templateCompilerPath + '.js'];
};
