'use strict';

var fs = require('fs');

var _require = require('path'),
    dirname = _require.dirname;

var t = require('babel-types');

var _require2 = require('babylon'),
    parse = _require2.parse;

var _require3 = require('babel-traverse'),
    traverse = _require3.default;

var compose = require('compose-function');
var resolveFrom = require('resolve-from');
// const pretty = require('ast-pretty-print')
var optimize = require('./utils/optimize');
var svgtojsx = require('./utils/svg-to-jsx');

var escapeBraces = function escapeBraces(raw) {
  return raw.replace(/(\{|\})/g, '{`$1`}');
};

var readSvgFile = function readSvgFile(file, filename) {
  return fs.readFileSync(resolveFrom(dirname(filename), file), 'utf-8');
};

var parseAst = function parseAst(rawSource) {
  return parse(rawSource, {
    sourceType: 'module',
    plugins: ['jsx']
  });
};

var svgString = compose(escapeBraces, optimize, readSvgFile);

var svgBodyExpression = function svgBodyExpression(ast) {
  return traverse.removeProperties(ast.program.body[0].expression);
};

var reicons = function reicons(path, _ref) {
  var filename = _ref.file.opts.filename;

  var args = path.get('arguments');
  var file = args[0].evaluate().value;
  var raw = svgString(file, filename);
  var parsedAst = parseAst(raw);

  traverse(parsedAst, svgtojsx);

  path.replaceWith(t.functionExpression(t.identifier(path.parentPath.node.id.name), [t.identifier('props')], t.blockStatement([t.returnStatement(svgBodyExpression(parsedAst))])));
};

module.exports = function (_ref2) {
  var references = _ref2.references,
      state = _ref2.state;
  return references.default.forEach(function (_ref3) {
    var parentPath = _ref3.parentPath;

    if (t.isCallExpression(parentPath)) {
      reicons(parentPath, state);
    }
  });
};