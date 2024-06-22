"use strict";
import extractJSON from "../utils/extractJSON.js";
import { configDotenv } from "dotenv";
import Token from "../models/Token.js";

configDotenv();
const endpoints = extractJSON({ path: "../configs/endpoints.json" });
const urlAuthorization = endpoints["token"];

const secrets = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
};

//TODO: Esto lo mejor es guardarlo en la base de datos, que se guarde y asi guardar el tiempo de expiracion en 1 hora desde que se creo y asi actualizar el token si expiro
//! Aqui se hara ese acceso a la base de datos para actualizar siempre que expire ese token
/* Solo falta ese calculo ya que buscara primero ese valor en la base de datos, 
si no esta hace la llamada y si esta y expiro entonces hace la llamada, si no
ocurre ningun de los casos anteriores entonces simplemente se devuelve el token 
de la base de datos
*/
export const getTokenAPi = async () => {
  if (!secrets.client_id || !secrets.client_secret) return false;

  const now = new Date();

  const existingToken = await Token.findOne().sort({ expiresAt: -1 }).limit(1);

  // if (existingToken && existingToken.expiresAt > now) {
  //   return existingToken.token;
  // } else {
  // }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: secrets.client_id,
      client_secret: secrets.client_secret,
    }),
  };

  // console.log("Solicitando nuevo token...", options); // Indicar que se va a solicitar un nuevo token

  try {
    const response = await fetch(urlAuthorization, options);
    const result = await response.json();

    if (!result || !result.access_token) {
      console.error("Respuesta inválida o sin token:", result); // Indicar si la respuesta es inválida o no contiene un token
      return false;
    }

    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // Calcular la fecha de expiración

    await Token.deleteMany({});
    await Token.create({
      idToken: result.access_token,
      token: result.access_token,
      expiresAt: expiresAt,
    });

    // console.log("Token guardado exitosamente."); // Confirmar que el token fue guardado
    return result.access_token;
  } catch (error) {
    console.error("Hubo un error al obtener o guardar el token", error); // Registrar cualquier error que ocurra
    return false;
  }
};
