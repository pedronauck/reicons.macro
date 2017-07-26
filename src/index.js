const fs = require('fs')
const { dirname } = require('path')
const t = require('babel-types')
const { parse } = require('babylon')
const { default: traverse } = require('babel-traverse')
const compose = require('compose-function')
const resolveFrom = require('resolve-from')
const optimize = require('./utils/optimize')
const svgtojsx = require('./utils/svg-to-jsx')
const buildComponent = require('./utils/build-component')

const escapeBraces = (raw) =>
  raw.replace(/(\{|\})/g, '{`$1`}')

const readSvgFile = (file, filename) =>
  fs.readFileSync(resolveFrom(dirname(filename), file), 'utf-8')

const parseAst = (rawSource) => parse(rawSource, {
  sourceType: 'module',
  plugins: ['jsx']
})

const svgString = compose(
  escapeBraces,
  optimize,
  readSvgFile
)

const svgBodyExpression = (ast) =>
  traverse.removeProperties(ast.program.body[0].expression)

const reicons = (path, { file: { opts: { filename } } }) => {
  const args = path.get('arguments')
  const file = args[0].evaluate().value
  const raw = svgString(file, filename)
  const parsedAst = parseAst(raw)

  traverse(parsedAst, svgtojsx)

  const svgCode = svgBodyExpression(parsedAst)
  const replacement = buildComponent({
    ICON_NAME: t.identifier(path.parentPath.node.id.name),
    SVG_CODE: svgCode
  })

  path.parentPath.parentPath.replaceWith(replacement)
}

module.exports = ({ references, state }) =>
  references.default.forEach(({ parentPath }) => {
    if (t.isCallExpression(parentPath)) {
      reicons(parentPath, state)
    }
  })
