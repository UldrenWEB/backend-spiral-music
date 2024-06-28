import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    idSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Songs' }],
});

export default mongoose.model('Playlist', PlaylistSchema);


