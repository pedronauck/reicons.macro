const Svgo = require('svgo')

const optimize = (svgString) => {
  let result

  new Svgo().optimize(svgString, (res) => {
    if (!res.error) result = res.data
  })

  return result
}

module.exports = optimize
