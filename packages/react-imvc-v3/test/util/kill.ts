import cp, { ChildProcess } from 'child_process'

export default function kill(processing: ChildProcess) {
  let isWin = /^win/.test(process.platform)
  console.log(processing.pid)
  console.log(process.pid)
  if (!isWin) {
    process.kill(processing.pid)
  } else {
    cp.exec(`taskkill /PID ${processing.pid} /t`, (error, stdout, stderr) => {
      if (error !== null) {
        console.log('exec error: ' + error)
      }

      console.log('stdout: ' + stdout)
      console.log('stderr: ' + stderr)
    })
  }
  processing.kill()
}
