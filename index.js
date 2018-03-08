const SpotifyWebApi = require('spotify-web-api-node');
const Promise = require('bluebird');
const express = require('express');
const algo = require('./algo');
const { fromPairs, compose, take, difference } = require('lodash/fp');
const getSongsForList = require('./getSongsForList');

const app = express();

const hostname = process.env.NOW ? 'https://grouplist.now.sh' : 'http://localhost:5000';

const spotifyApi = new SpotifyWebApi({
  clientId : '5c12a599bc8447dea6b4a6b8cba47aa7',
  clientSecret : process.env.SPOT_SECRET,
  redirectUri: hostname
});

spotifyApi.setRefreshToken(process.env.SPOT_REFRESH_TOKEN);
main(spotifyApi).catch(console.error);
setInterval(() => main(spotifyApi).catch(console.error), 120000);

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
      .catch((err) => {
        console.error(err);
        res.send(500);
      });

  } else {
    res.redirect(spotifyApi.createAuthorizeURL(scopes))
  }
});

app.listen(5000);

const users = ['chrismatheson', 'savrinni', 'musicalkaye', 'randallwood', 'garethh', '1138476860', 'marshallonthemove', 'steffyj86'];
const foundLists = [
    {owner:{id: 'garethh'}, id: '2ekaf0xqvybXB55TDm9hzL'},
    {owner:{id: 'chrismatheson'}, id: '08uQb6gbLhCDtbqZBzfC1D'},
    {owner:{id: 'savrinni'}, id: '04juwxnJRCaVonoN2Wxz6Y'},
    {owner:{id: 'musicalkaye'}, id: '0nZQSWptbQBxF2PZCTupGt'},
    {owner:{id: 'marshallonthemove'}, id: '7oTirG5vz84Ys7OYgpMCaP'},
    {owner:{id: 'steffyj86'}, id: '26GMWxF6WgCUK0e7yeJXFI'},
    {owner:{id: '21c5zjmfasenbsj4arrzz27gy'}, id: '2nye63RovnBdYpjEhWMED4'}
];


async function main(spotifyApi) {
  console.log(('refreshing access token'));
  await spotifyApi.refreshAccessToken().then((data) => {
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('SUCCESS::token refreshed - ', spotifyApi.getAccessToken());
  }, () => console.error('FAILED::token refresh'));

  var targetList = (await spotifyApi.getUserPlaylists('chrismatheson')).body.items.filter(({name}) => name == 'Target')[0];

  targetList = targetList || (await spotifyApi.createPlaylist('chrismatheson', 'Target', { 'public' : false })).body;

  const whatWeWantTheListToBe = await Promise.map(foundLists, list => getSongsForList(spotifyApi, list))
      .then(compose(algo, fromPairs));

  const [ user, existingSongs ] = await getSongsForList(spotifyApi, targetList);

  const toAdd = difference(whatWeWantTheListToBe, existingSongs);
  const toRemove = difference(existingSongs, whatWeWantTheListToBe);

  console.log(`existing ${existingSongs.length}:target${whatWeWantTheListToBe.length} adding ${toAdd}, removing${toRemove}`)

  await spotifyApi.addTracksToPlaylist(targetList.owner.id, targetList.id, take(100, toAdd));

  const req = take(100, toRemove).map((uri) => ({uri}));
  await spotifyApi.removeTracksFromPlaylist(targetList.owner.id, targetList.id, req);
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

const scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-library-modify',
    'playlist-modify-private',
    'user-follow-read',
    'playlist-read-collaborative',
    'playlist-read-private',
    'playlist-modify-public'
];
