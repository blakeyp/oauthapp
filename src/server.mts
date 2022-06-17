import 'dotenv/config'
import express from 'express'
import cookieSession from 'cookie-session'
import { v4 as uuidv4 } from 'uuid'
import { generateAuthorizeUrl, generateTokenRequestBody, generateTokenUrl, generateProfileUrl } from './utils.mjs'

const app = express()
const port = 4000

app.use(cookieSession({
  name: 'session',
  secret: 'secret!',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.get('/auth', (req, res) => {
  const state = uuidv4()
  if (req.session) {
    req.session.state = state
  }
  const authorizeUrl = generateAuthorizeUrl(state)
  res.redirect(authorizeUrl)
})

app.get('/api/callback', async (req, res) => {
  const { state, code } = req.query as Record<string, string>
  if (!req.session?.state || req.session.state !== state) {
    return res.sendStatus(401)
  }
  const response = await fetch(generateTokenUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: generateTokenRequestBody(code)
  })
  const data = await response.json() as { access_token: string }
  if (response.status !== 200) {
    return res.sendStatus(401)
  }
  req.session.token = data.access_token
  return res.send('<h1>You\'re in! Click <a href="/profile">here</a>!</h1>')
})

app.get('/profile', async (req, res) => {
  const response = await fetch(generateProfileUrl(req.session?.token as string), {
    method: 'POST',
  })
  if (response.status !== 200) {
    return res.sendStatus(response.status)
  }
  const data = await response.json() as Record<string, string>
  return res.send(`
    <h1>Hello ${data.name}!</h1>
    <img src="${data.picture}" alt="user_image" />
  `)
})

app.listen(port)
console.log(`Listening on port ${port}`)
