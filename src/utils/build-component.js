const template = require('babel-template')

const buildTemplate = template(`
  var ICON_NAME = function ICON_NAME(props) { return SVG_CODE };
`, {
  plugins: ['jsx']
})

module.exports = buildTemplate
