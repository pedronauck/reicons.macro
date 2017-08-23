const t = require('babel-types')
const camelCase = require('lodash.camelcase')
const cssToObj = require('css-to-object')

const transformNamespaceProps = (path) => {
  if (t.isJSXNamespacedName(path.node.name)) {
    path.node.name = t.jSXIdentifier(
      camelCase(`${path.node.name.namespace.name}:${path.node.name.name.name}`)
    )
  }
}

const transformClassName = (path) => {
  if (path.node.name.name === 'class') {
    path.node.name.name = 'className'
  }
}

const transformStyleProp = (path) => {
  const nodeName = path.node.name.name
  const nodeValue = path.node.value

  if (nodeName === 'style') {
    const obj = cssToObj(nodeValue.value)

    const properties = Object.keys(obj).map(prop => t.objectProperty(
      t.identifier(camelCase(prop)),
      t.stringLiteral(obj[prop])
    ))

    path.node.value = t.jSXExpressionContainer(
      t.objectExpression(properties)
    )
  }
}

const transformRestProps = (path) => {
  path.node.name.name = camelCase(path.node.name.name)
}

const removeFillProps = (path) => {
  const nodeName = path.node.name.name

  if (nodeName === 'fill' || nodeName === 'fillRule') {
    path.remove()
  }
}

const transformBasicProps = (path) => {
  if (t.isJSXIdentifier(path.node.name)) {
    transformRestProps(path)
    transformStyleProp(path)
    transformClassName(path)
  }
}

const addSpreadProps = ({ node }) => {
  if (node.name.name.toLowerCase() === 'svg') {
    node.attributes.push(t.jSXSpreadAttribute(t.identifier('props')))
  }
}

module.exports = {
  JSXAttribute(path) {
    transformNamespaceProps(path)
    transformBasicProps(path)
    removeFillProps(path)
  },
  JSXOpeningElement(path) {
    addSpreadProps(path)
  }
}
