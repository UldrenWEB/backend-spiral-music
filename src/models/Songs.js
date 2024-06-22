const mongoose = require('mongoose');

const SongsSchema = new mongoose.Schema({
    idSong: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true },
    image: { type: String, required: true },
    url_cancion: { type: String, required: true },
    idArtist: [{ type: Schema.Types.ObjectId, ref: 'Artist', required: true }],
});

module.exports = mongoose.model('Songs', SongsSchema)