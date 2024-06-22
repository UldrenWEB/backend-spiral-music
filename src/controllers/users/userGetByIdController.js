const User = require('../../models/User'); // Asegúrate de que la ruta sea correcta

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.status(200).json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}



