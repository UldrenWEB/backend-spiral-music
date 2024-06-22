const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    idArtist: { type: String, required: true, unique: true },
    genre: [{ type: String, required: true }],
    image: { type: String, required: true },
    popularity: { type: Number, required: true },
});

module.exports = mongoose.model('Artist', ArtistSchema);



