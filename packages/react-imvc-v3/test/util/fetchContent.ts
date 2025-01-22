import fetch from 'node-fetch'

export default async function fetchContent(url: string): Promise<string> {
  let response = await fetch(url)
  let content = await response.text()
  return content
}
