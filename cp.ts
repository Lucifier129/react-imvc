import fse from 'fs-extra'

(async () => {
  await fse.copyFile('src/type.d.ts', 'dist/type.d.ts');
  console.log(`File copied: src/type.d.ts`);
})();