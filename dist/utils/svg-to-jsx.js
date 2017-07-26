'use strict';

var t = require('babel-types');
var camelCase = require('lodash.camelcase');
var cssToObj = require('css-to-object');

var transformNamespaceProps = function transformNamespaceProps(path) {
  if (t.isJSXNamespacedName(path.node.name)) {
    path.node.name = t.jSXIdentifier(camelCase(path.node.name.namespace.name + ':' + path.node.name.name.name));
  }
};

var transformClassName = function transformClassName(path) {
  if (path.node.name.name === 'class') {
    path.node.name.name = 'className';
  }
};

var transformStyleProp = function transformStyleProp(path) {
  var nodeName = path.node.name.name;
  var nodeValue = path.node.value;

  if (nodeName === 'style') {
    var obj = cssToObj(nodeValue.value);

    var properties = Object.keys(obj).map(function (prop) {
      return t.objectProperty(t.identifier(camelCase(prop)), t.stringLiteral(obj[prop]));
    });

    path.node.value = t.jSXExpressionContainer(t.objectExpression(properties));
  }
};

var transformRestProps = function transformRestProps(path) {
  path.node.name.name = camelCase(path.node.name.name);
};

var transformBasicProps = function transformBasicProps(path) {
  if (t.isJSXIdentifier(path.node.name)) {
    transformRestProps(path);
    transformStyleProp(path);
    transformClassName(path);
  }
};

var addSpreadProps = function addSpreadProps(_ref) {
  var node = _ref.node;

  if (node.name.name.toLowerCase() === 'svg') {
    node.attributes.push(t.jSXSpreadAttribute(t.identifier('props')));
  }
};

module.exports = {
  JSXAttribute: function JSXAttribute(path) {
    transformNamespaceProps(path);
    transformBasicProps(path);
  },
  JSXOpeningElement: function JSXOpeningElement(path) {
    addSpreadProps(path);
  }
};