'use strict';

var Svgo = require('svgo');

var optimize = function optimize(svgString) {
  var result = void 0;

  new Svgo().optimize(svgString, function (res) {
    if (!res.error) result = res.data;
  });

  return result;
};

module.exports = optimize;