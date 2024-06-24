import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    genre: [{ type: String, required: true }],
    image: { type: String, required: true },
    popularity: { type: Number, required: true },
});


export default mongoose.model('Artist', ArtistSchema);





