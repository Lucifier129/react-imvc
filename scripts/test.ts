process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'

import jest from 'jest'
import yargs from 'yargs'

import 'core-js/stable'
import 'regenerator-runtime/runtime'


import fs from 'fs'
import path from 'path'
import getConfig from '../config'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
const project = fs.readdirSync(process.cwd()).forEach(file => {
jest.runCLI(yargs.argv, [
	process.cwd()
])
.then((success) => {
	console.log(success);
})
.catch((failure) => {
	console.error(failure);
});
// process.on('unhandledRejection', error => {
// 	throw error
// })

// let config = getConfig(yargs.argv)

// require('@babel/register')({
// 	...config.babel(true),
// 	extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
// })
// // Instantiate a Mocha instance.
// let mocha = new Mocha(<Mocha.MochaOptions>yargs.argv)

// const travelDirectoryToAddTestFiles = (dir: string) => {
// 	fs.readdirSync(dir).forEach(file => {
// 		let filename = path.join(dir, file)
// 		// ignore node_modules
// 		if (filename.indexOf('node_modules') !== -1) {
// 			return
// 		}
// 		// read file deeply
// 		if (fs.statSync(filename).isDirectory()) {
// 			return travelDirectoryToAddTestFiles(filename)
// 		}
// 		// add *test.js file to the mocha instance
// 		if (filename.substr(-8) === '-test.js') {
// 			return mocha.addFile(filename)
// 		}
// 	})
// }

// travelDirectoryToAddTestFiles(process.cwd())

// // Run the tests.
// mocha.run((failures) => {
// 	process.on('exit', function() {
// 		process.exit(failures) // exit with non-zero status if there were failures
// 	})
// })
