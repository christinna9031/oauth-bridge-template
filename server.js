const url = require('url');
let express = require('express')
let request = require('request')
let querystring = require('querystring')

let app = express()
let client_id, client_secret, credentials

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'




app.get('/login', function(req, res) {

  client_id = req.query.client_id
client_secret = req.query.client_secret
  credentials = new Buffer(client_id + ':' + client_secret).toString('base64')
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id, //process.env.SPOTIFY_CLIENT_ID,
      scope: 'playlist-modify-private playlist-modify-public user-library-read user-read-recently-played user-read-playback-state user-top-read app-remote-control playlist-modify-public user-modify-playback-state user-read-currently-playing user-follow-read user-library-modify user-read-playback-position user-library-read streaming',
      redirect_uri: redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer( //process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        client_id + ':' + client_secret  
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    var refresh_token= body.refresh_token
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token +'&refresh_token=' + refresh_token+ '&id=' + credentials)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)
