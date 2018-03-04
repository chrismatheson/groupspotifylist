const { once } = require('lodash/fp');
const SpotifyWebApi = require('spotify-web-api-node');

const hostname = process.env.NOW ? 'https://grouplist.now.sh' : 'http://localhost:5000';
const spotifyApi = new SpotifyWebApi({
    clientId : '5c12a599bc8447dea6b4a6b8cba47aa7',
    clientSecret : process.env.SPOT_SECRET,
    redirectUri: hostname
});

spotifyApi.setRefreshToken(process.env.SPOT_REFRESH_TOKEN);

module.exports = once(()=> spotifyApi.refreshAccessToken()
    .then((data) => {
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log('SUCCESS::token refreshed - ', spotifyApi.getAccessToken());
    }, () => Promise.reject('FAILED::token refresh')));
