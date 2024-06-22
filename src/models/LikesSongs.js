const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    idSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Songs' },
});

module.exports = mongoose.model('LikesSongs', LikeSchema);
