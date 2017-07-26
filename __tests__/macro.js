/* eslint no-undef: 0 */

const path = require('path')
const pluginTester = require('babel-plugin-tester')
const plugin = require('babel-macros')

const projectRoot = path.join(__dirname, '../')

expect.addSnapshotSerializer({
  print(val) {
    return val.split(projectRoot).join('<PROJECT_ROOT>/')
  },
  test(val) {
    return typeof val === 'string'
  }
})

pluginTester({
  plugin,
  snapshot: true,
  tests: withFilename([{
    title: 'as function',
    code: `
      const reicons = require('../reicons.macro')
      const IcCheck = reicons('./tick.svg')
    `
  }, {
    title: 'with function around',
    code: `
      const reicons = require('../reicons.macro')

      const createIcon = (Icon) => {
        return <Icon />
      }

      const IcCheck = createIcon(reicons('./tick.svg'))
    `
  }])
})

function withFilename(tests) {
  return tests.map(t => {
    const test = { babelOptions: { filename: __filename } }

    if (typeof t === 'string') {
      test.code = t
    }
    else {
      Object.assign(test, t)
      test.babelOptions.parserOpts = test.babelOptions.parserOpts || {}
    }

    Object.assign(test.babelOptions.parserOpts, {
      plugins: ['jsx']
    })

    return test
  })
}
