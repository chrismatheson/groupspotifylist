const SpotifyWebApi = require('spotify-web-api-node');
const Promise = require('bluebird');
const { createServer } = require('http');
const { parse } = require('url');
const express = require('express');
const algo = require('./algo');
const { fromPairs, compose, contains, groupBy, values, map } = require('lodash/fp');

const app = express();

const hostname = process.env.NOW ? 'https://grouplist.now.sh' : 'http://localhost:5000';

const spotifyApi = new SpotifyWebApi({
  clientId : '5c12a599bc8447dea6b4a6b8cba47aa7',
  clientSecret : process.env.SPOT_SECRET,
  redirectUri: hostname
});

spotifyApi.setRefreshToken(process.env.SPOT_REFRESH_TOKEN);
main(spotifyApi).catch(console.error);
setInterval(() => main(spotifyApi).catch(console.error), 60000);

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
    {owner:{id: 'steffyj86'}, id: '26GMWxF6WgCUK0e7yeJXFI'}
];


async function main(spotifyApi) {
  console.log(('refreshing access token'));
  await spotifyApi.refreshAccessToken().then((data) => {
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('SUCCESS::token refreshed - ', spotifyApi.getAccessToken());
  }, () => console.error('FAILED::token refresh'));

  var targetList = (await spotifyApi.getUserPlaylists('chrismatheson').then(unwrapSuccessfullResponse)).items.filter(({name}) => name == 'Target')[0];

  targetList = targetList || (await spotifyApi.createPlaylist('chrismatheson', 'Target', { 'public' : false })).body;

  // const foundLists = Promise.filter(spotifyApi.searchPlaylists('Boarding18').then(res => res.body.playlists.items), list => contains(list.owner.id, users));

  const combined = Promise.map(foundLists, list => getSongsForList(spotifyApi, list))
      .then(compose(algo, fromPairs));

  // console.log('UsersIncluded::' + (await foundLists).map(list=> list.owner.id).join(','))

  const batched = combined.then(z => {
      const numOfBins = (Math.floor(z.length / 90) + 1);
      return groupBy((x) => z.indexOf(x) % numOfBins, z)
  }).then(x => values(x));

    return resetList(spotifyApi, targetList)
    .then(() => batched.map(tracks => spotifyApi.addTracksToPlaylist(targetList.owner.id, targetList.id, tracks)))
    .then(() => combined, (err) => {
      debugger;
    });
}

async function resetList(spotifyApi, list) {
  const [user,songs] = await getSongsForList(spotifyApi, list)
  const req = songs.map(uri => ({uri}));
  console.log('====Clearing List====');
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
