module.exports = async function getSongsForList(spotifyApi, list) {
    let tracks = { next: false };
    const allSongs = [];
    do {
        tracks = (await spotifyApi.getPlaylistTracks(list.owner.id, list.id, {offset:allSongs.length})).body;
        allSongs.push(...tracks.items.map(x => x.track.uri));
    } while(tracks.next);

    // const {tracks:{ items }} =
    return [list.owner.id, allSongs];
}
