const SpotifyWebApi = require('spotify-web-api-node');
const expect = require('expect');
const getSongsForList = require('./getSongsForList');

const hostname = process.env.NOW ? 'https://grouplist.now.sh' : 'http://localhost:5000';
const spotifyApi = new SpotifyWebApi({
    clientId : '5c12a599bc8447dea6b4a6b8cba47aa7',
    clientSecret : process.env.SPOT_SECRET,
    redirectUri: hostname
});

spotifyApi.setRefreshToken(process.env.SPOT_REFRESH_TOKEN);

describe('getSongsForList', function () {
    beforeEach(() => spotifyApi.refreshAccessToken().then((data) => {
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log('SUCCESS::token refreshed - ', spotifyApi.getAccessToken());
    }, () => Promise.reject('FAILED::token refresh')));

    it('should return all tracks', async function () {
        const listId = '4om4GSKtvl6x3qEhIwmOkz';
        const list = {owner:{id:'chrismatheson'}, id: listId};

        const [user, songs ] = await getSongsForList(spotifyApi, list);

        expect(songs.length).toBeGreaterThan(100);
    });
});
