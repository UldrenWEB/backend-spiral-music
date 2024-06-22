const User = require('../../models/User'); // Asegúrate de que la ruta sea correcta
require('dotenv').config();

exports.remove = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        // Reemplaza user.remove() con user.deleteOne() o User.deleteOne({ _id: user._id })
        await user.deleteOne();
        // O alternativamente, si prefieres usar el modelo directamente:
        // await User.deleteOne({ _id: user._id });
        res.json({ msg: 'Cuenta eliminada' });
      } catch (error) {
        console.error(error); // Para depuración, puedes manejar el error como prefieras
        res.status(500).json({ msg: 'Error interno del servidor' });
      }
    };