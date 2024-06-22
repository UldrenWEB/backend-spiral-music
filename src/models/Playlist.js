const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    idPlaylist: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    idSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Songs' }],
});

module.exports = mongoose.model('Playlist', PlaylistSchema)