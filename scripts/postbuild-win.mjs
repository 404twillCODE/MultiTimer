import path from 'path'
import { fileURLToPath } from 'url'
import { rcedit } from 'rcedit'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')
const exePath = path.join(projectRoot, 'dist', 'win-unpacked', 'MultiTimer.exe')
const iconPath = path.join(projectRoot, 'build', 'icon.ico')

if (!fs.existsSync(exePath)) {
  console.error('MultiTimer.exe not found. Run electron-builder --win --dir first.')
  process.exit(1)
}
if (!fs.existsSync(iconPath)) {
  console.error('build/icon.ico not found. Run node scripts/build-icon.cjs first.')
  process.exit(1)
}

try {
  await rcedit(exePath, { icon: iconPath })
  console.log('Icon set on MultiTimer.exe')
} catch (err) {
  console.error(err)
  process.exit(1)
}
