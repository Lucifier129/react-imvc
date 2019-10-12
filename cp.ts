import fse from 'fs-extra'

;(async () => {
  await fse.copyFile('src/index.d.ts', 'dist/index.d.ts')
  console.log(`File copied: src/index.d.ts`)
})()