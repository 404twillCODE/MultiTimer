const fs = require('fs')
const path = require('path')
const pngToIco = require('png-to-ico').default || require('png-to-ico')

const projectRoot = path.join(__dirname, '..')
const pngPath = path.join(projectRoot, 'icon.png')
const buildDir = path.join(projectRoot, 'build')
const icoPath = path.join(buildDir, 'icon.ico')

;(async () => {
  try {
    const buf = await pngToIco(pngPath)
    fs.mkdirSync(buildDir, { recursive: true })
    fs.writeFileSync(icoPath, buf)
    console.log('Created build/icon.ico')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
