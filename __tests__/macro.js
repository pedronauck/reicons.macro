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

const hasError = (message) => (err) => {
  if (err && new RegExp(message).test(err.message)) {
    return true
  }
}

pluginTester({
  plugin,
  snapshot: true,
  tests: withFilename([{
    title: 'as function',
    code: `
      const reicons = require('../reicons.macro')
      const IcTick = reicons('./tick.svg')
    `
  }, {
    title: 'with function around',
    code: `
      const reicons = require('../reicons.macro')

      const createIcon = (Icon) => {
        return <Icon />
      }

      const IcTick = createIcon(reicons('./tick.svg'))
    `
  }, {
    title: 'throw if has not .svg file extension',
    snapshot: false,
    error: hasError('You need to require a valid .svg file!'),
    code: `
      const reicons = require('../reicons.macro')
      const IcTick = reicons('./tick')
    `
  }, {
    title: 'throw if file doesn\'t exist',
    snapshot: false,
    error: hasError('Cannot find module \'./check.svg\''),
    code: `
      const reicons = require('../reicons.macro')
      const IcCheck = reicons('./check.svg')
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
