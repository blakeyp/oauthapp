const google_auth_endpoint ='https://accounts.google.com/o/oauth2/v2/auth'
const google_token_endpoint = 'https://oauth2.googleapis.com/token'

const scopes = ['profile', 'email', 'openid']

export const generateAuthorizeUrl = (state: string): string => {
  const auth_params: Record<string, string> = {
    client_id: process.env.CLIENT_ID ?? '',
    redirect_uri: 'http://localhost:4000/api/callback',
    response_type: 'code',
    state
  }
  return `${google_auth_endpoint}?${new URLSearchParams(auth_params).toString()}&scope=${scopes.join (' ')}`
}

export const generateTokenUrl = () => google_token_endpoint

export const generateTokenRequestBody = (auth_code: string): string => {
  const token_params: Record<string, string> = {
    client_id: process.env.CLIENT_ID ?? '',
    client_secret: process.env.CLIENT_SECRET ?? '',
    redirect_uri: 'http://localhost:4000/api/callback',
    grant_type: 'authorization_code',
    code: auth_code,
  }
  return new URLSearchParams(token_params).toString()
}

export const generateProfileUrl = (token: string): string => {
  return `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${token}`
}
