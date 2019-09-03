// Type definitions for gulp-clean-css v2.0.6
// Project: https://github.com/scniro/gulp-clean-css
// Definitions by: Giedrius Grabauskas <https://github.com/giedriusgrabauskas>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "gulp-clean-css" {

  import * as CleanCSS from 'clean-css' 

  interface DetailsStats {
      originalSize: number | undefined
      minifiedSize: number | undefined
  }

  interface Details {
      name: string
      stats: DetailsStats
  }


  interface GulpCleanCss {
      (options?: CleanCSS.Options, callback?: (details: Details) => void): NodeJS.ReadWriteStream
  }

  let _temp: GulpCleanCss

  export = _temp

}