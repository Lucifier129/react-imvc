import fsExtra from 'fs-extra'

fsExtra.copyFile('src/index.d.ts', 'dist/index.d.ts')
console.log(`File copied: src/index.d.ts`)