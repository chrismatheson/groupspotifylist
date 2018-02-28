const SpotifyWebApi = require('spotify-web-api-node');
const { map } = require('bluebird');
const { createServer } = require('http');
const { parse } = require('url');
const express = require('express');
const algo = require('./algo');
const {fromPairs, compose} = require('lodash/fp');

const app = express();

const hostname = process.env.NOW ? 'https://grouplist.now.sh' : 'http://localhost:5000';

const spotifyApi = new SpotifyWebApi({
  clientId : '5c12a599bc8447dea6b4a6b8cba47aa7',
  clientSecret : process.env.SPOT_SECRET,
  redirectUri: hostname
});

app.get('/healthcheck', function (req, res) {
    spotifyApi.getMe()
        .then(() => res.send(200))
        .catch((err) => {
            res.send(500);
        });
});

app.get('/', function (req, res) {
  if( spotifyApi.getAccessToken()) {
    return spotifyApi.getMe()
      .then(() => res.send('auth-ok'))
      .catch(() => res.send(500));
  }

  if(req.query.code) {
    spotifyApi.authorizationCodeGrant(req.query.code)
      .then(persistTokens(spotifyApi))
      .then(() => res.redirect('/'))
      .then(() => setInterval(() => main(spotifyApi).catch(console.error), 10000))
      .catch((err) => {
        console.error(err);
        res.send(500);
      });

  } else {
    res.redirect(spotifyApi.createAuthorizeURL(scopes))
  }
});

app.listen(5000);

const users = ['chrismatheson', 'savrinni', 'musicalkaye', 'randallwood', 'garethh', '1138476860', 'marshallonthemove']

async function main(spotifyApi) {
  console.log(('refreshing access token'));
  await spotifyApi.refreshAccessToken().then((data) => {
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('SUCCESS::token refreshed - ', spotifyApi.getAccessToken());
  }, () => console.error('FAILED::token refresh'));

  var targetList = (await spotifyApi.getUserPlaylists('chrismatheson').then(unwrapSuccessfullResponse)).items.filter(({name}) => name == 'Target')[0];

  targetList = targetList || (await spotifyApi.createPlaylist('chrismatheson', 'Target', { 'public' : false })).body;

  const combined = await map(users, usr => spotifyApi.getUserPlaylists(usr))
    .map(unwrapSuccessfullResponse)
    .map(selectTargetplaylist)
    .filter(list => !!list)
    .map(list => getSongsForList(spotifyApi, list))
    .then(compose(algo, fromPairs));

  return resetList(spotifyApi, targetList)
    .then(() => spotifyApi.addTracksToPlaylist(targetList.owner.id, targetList.id, combined))
    .then(() => combined, (err) => {
      debugger;
    });
}

async function resetList(spotifyApi, list) {
  const songs = await getSongsForList(spotifyApi, list)
  const req = songs.map(uri => ({uri}));
  console.log('====Removing====\n', req, '============\n');
  return spotifyApi.removeTracksFromPlaylist(list.owner.id, list.id, req);
}

async function getSongsForList(spotifyApi, list) {
  const {tracks:{ items }} = await spotifyApi.getPlaylist(list.owner.id, list.id).then(unwrapSuccessfullResponse);
  return [list.owner.id, items.map(x => x.track.uri)];
}

function selectTargetplaylist({items}) {
  return items.filter(({name}) => name == 'Boarding18')[0] || null;
}

function unwrapSuccessfullResponse(res) {
  return res.body;
}

function persistTokens(spotifyApi) {
  return function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    spotifyApi.setAccessToken(data.body['access_token']);

    // Set the access token on the API object to use it in later calls
    if(data.body['refresh_token']) {
      console.log('The refresh token is ' + data.body['refresh_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
    }
    return spotifyApi;
  }
}

// bypass()
//   .then(main)
//   .catch(function (err) {
//     console.error(err);
//     process.exit(1);
//   });

function bypass() {
  var spotifyApi = new SpotifyWebApi({
    clientId : '5c12a599bc8447dea6b4a6b8cba47aa7',
    clientSecret : '97f9160a90fc48c881c7a7bae613a735',
    redirectUri: 'http://localhost:5000/token'
  });

  const access_token = 'BQAtrLO1yCkdwlfIeimqrqzgAFHmGJ9VI-bi6YQGhJoXaav7tk896A-R7reuB7_dnaKX_j3RT1NMAipDfHX0-QlGdrtPdxqXzgji5OwY_7OdTG8WOHF0YqYLy8ooXNH_z5BkTBkLzkp2OHM73f5p0_ht90-dKBEC41-M16hDzGLefhe2EoDZS5kB9Vn-BIe6XyHxKO_Ws2Auyg';
  const refresh_token = 'AQBgIVUtb5YYRmkWfEL2yFRsmW4kBbl-g7dJV2l0-HjzaVE879ofAT0pHecPqLEMUoYpy_S2bEazbVUlbHMG1f32DSfW4eINLjBW3vBZEouE-8UtaH7a9MSBm2s2ZSNBVs0';

  spotifyApi.setAccessToken(access_token);
  spotifyApi.setRefreshToken(refresh_token);
  return Promise.resolve(spotifyApi);
}

function auth() {


  var token = new Promise(function(resolve) {
    var server = createServer(function({url}, res) {
      resolve(parse(url, true).query.code);
      res.statusCode = 200;
      return res.end();
    });
    server.listen(5000);
  });

  var authorizeURL = spotifyApi.createAuthorizeURL(scopes);

  console.log(authorizeURL);

  return token
    .then(x => spotifyApi.authorizationCodeGrant(x))
    .then(function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      return spotifyApi;
    })
}

const scopes = [
  'user-read-private',
  'user-read-email',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-modify-public'
];