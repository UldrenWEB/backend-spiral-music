import User from '../../models/User.js'; // Asegúrate de que la ruta sea correcta
import { configDotenv } from "dotenv";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


configDotenv();

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Credenciales incorrectas' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Credenciales incorrectas' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // Envía un mensaje de éxito junto con el token
      res.json({ msg: 'Has iniciado sesión correctamente', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  };   
