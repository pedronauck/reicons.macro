const fs = require('fs')
const { dirname } = require('path')
const t = require('babel-types')
const { parse } = require('babylon')
const { default: traverse } = require('babel-traverse')
const compose = require('compose-function')
const resolveFrom = require('resolve-from')
const pretty = require('ast-pretty-print')
const optimize = require('./utils/optimize')
const svgtojsx = require('./utils/svg-to-jsx')

const escapeBraces = (raw) =>
  raw.replace(/(\{|\})/g, '{`$1`}')

const readSvgFile = (file, filename) =>
  fs.readFileSync(resolveFrom(dirname(filename), file), 'utf-8')

const parseAst = (rawSource) => parse(rawSource, {
  sourceType: 'module',
  plugins: ['jsx']
})

const svgStringAndAst = compose(
  parseAst,
  escapeBraces,
  optimize,
  readSvgFile
)

const svgBodyExpression = (ast) =>
  traverse.removeProperties(ast.program.body[0].expression)

const getParentName = (path) => {
  if (!path || !path.parentPath) return null
  return t.isVariableDeclarator(path) ? path.node.id.name : getParentName(path.parentPath)
}

const fileValue = (path) =>
  path.get('arguments')[0].evaluate().value

const isSvgFile = (file) => /.svg$/.test(file)

const reicons = (path, file, { file: { opts: { filename } } }) => {
  const funcName = getParentName(path.parentPath)
  const parsedAst = svgStringAndAst(file, filename)

  traverse(parsedAst, svgtojsx)

  path.replaceWith(t.functionExpression(
    funcName ? t.identifier(funcName) : null,
    [t.identifier('props')],
    t.blockStatement(
      [t.returnStatement(svgBodyExpression(parsedAst))]
    )
  ))
}

module.exports = ({ references, state }) =>
  references.default.forEach(({ parentPath }) => {
    const file = fileValue(parentPath)

    if (!isSvgFile(file)) {
      throw state.file.buildCodeFrameError(
        parentPath.node,
        'You need to require a valid .svg file!'
      )
    }

    if (isSvgFile(file) && t.isCallExpression(parentPath)) {
      reicons(parentPath, file, state)
    }
  })
