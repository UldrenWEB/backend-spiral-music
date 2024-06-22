"use strict";
import extractJSON from "../utils/extractJSON.js";
import { configDotenv } from "dotenv";

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
  const { client_id, client_secret } = secrets;

  if (!client_id || !client_secret) return false;

  const options = {
    method: "POST",
    header: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id,
      client_secret,
    }),
  };

  try {
    const response = await fetch(urlAuthorization, options);
    const result = await response.json();

    if (!result) return false;

    return result["access_token"];
  } catch (error) {
    console.log("Hubo un error al obtener token", error.message());
    return false;
  }
};
