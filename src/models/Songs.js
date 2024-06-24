import mongoose, { Schema } from 'mongoose';


 const SongsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true },
    image: { type: String, required: true },
    url_cancion: { type: String, required: true },
    idArtist: [{ type: Schema.Types.ObjectId, ref: 'Artist', required: true }],
});

export default mongoose.model('Songs', SongsSchema);

