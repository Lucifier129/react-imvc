import type { AllowlistOption } from 'webpack-node-externals'

export type CompileNodeModulesOptions = {
  rules?: AllowlistOption[]
}

export const checkFilename = (
  filename: string,
  rules?: CompileNodeModulesOptions['rules']
) => {
  if (!rules) {
    return !filename.includes('node_modules')
  }

  let isMatched = false

  for (const rule of rules) {
    if (typeof rule === 'string') {
      if (filename.includes(rule)) {
        isMatched = true
        break
      }
    } else if (typeof rule === 'function') {
      if (rule(filename)) {
        isMatched = true
        break
      }
    } else {
      if (rule.test(filename)) {
        isMatched = true
        break
      }
    }
  }

  return isMatched
}
