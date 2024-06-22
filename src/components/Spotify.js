"use strict";
import { apiFetch } from "../services/apiFetch.js";

class Spotify {
  constructor() {}

  getTracks = ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();
    const obj = {
      name: { type: "search", option: { type: "track", limit, offset } },
      id: { type: "tracks" },
    };

    if (!obj[byFormatted]) return { error: "Incorrect option" };

    try {
      const used = obj[byFormatted];
    } catch (error) {
      console.log(`Hubo un error al obtener canciones ${error}`);
      return { error: error.message };
    }
  };

  //Obtener albums por id o por nombre
  getAlbums = async ({ by, param, limit = 10, offset = 0 }) => {
    // const option = {
    //   name: { type: "search", search: "album" },
    //   id: { type: "albums", search: "tracks" },
    // };

    // this.#useApiFetch({
    //   by: "",
    // });

    const byFormatted = by.toLowerCase();
    const obj = {
      name: { type: "search", option: { type: "album", limit, offset } },
      id: { type: "albums" },
    };

    if (!obj[byFormatted]) return { error: "Incorrect option" };

    const used = obj[byFormatted];
    try {
      const result = await apiFetch({
        type: used["type"],
        option: typeof used["option"] === "string" ? used["option"] : undefined,
        body:
          byFormatted === "id" ? { id: param } : { param, ...used["option"] },
      });

      let albums = [];
      if (byFormatted === "name") {
        const arrayAlbums = result["albums"]["items"];

        for (const album of arrayAlbums) {
          // Obtener artistas del álbum
          const artistsAlbum = await this.#getArtistParsed({
            prop: album.artists,
          });

          //*Obtengo las tracks del Album y el genero correspondiente para cada cancion
          const { tracks, genres } = await this.#getGenres({
            id: album.id,
            arrayArtist: artistsAlbum,
          });

          //* Parsea tracks del album
          const arrayTracks = await this.#getTracksParsed({
            prop: tracks,
            genres,
          });

          const obj = {
            id: album.id,
            name: album.name,
            image: album.images[2],
            artists: artistsAlbum,
            genre: genres,
            tracks: arrayTracks,
            type: album.type,
          };

          albums.push(obj);
        }
      } else if (byFormatted === "id") {
        //*Obtener artistas del album
        const artistsAlbum = await this.#getArtistParsed({
          prop: result.artists,
        });

        const { tracks, genres } = await this.#getGenres({
          album: result,
          arrayArtist: artistsAlbum,
        });

        const arrayTracks = await this.#getTracksParsed({
          prop: tracks,
          genres,
        });

        const obj = {
          id: result.id,
          name: result.name,
          image: result.images[2],
          artists: artistsAlbum,
          genre: genres,
          tracks: arrayTracks,
        };

        albums.push(obj);
      }

      return albums.length > 1 ? albums : albums[0];
    } catch (error) {
      console.log(`Hubo un error al obtener albums ${error}`);
      return { error: error.message };
    }
  };

  #useApiFetch = async ({ by, param, options, limit, offset }) => {
    const byFormatted = by.toLowerCase();
    const obj = {
      name: {
        type: options["name"].type,
        option: { type: options["name"].search, limit, offset },
      },
      id: {
        type: options["id"].type,
        option: { type: options["id"].search },
      },
    };

    if (!obj[byFormatted]) return false;

    const used = obj[byFormatted];

    try {
      const result = await apiFetch({
        type: used["type"],
        option: typeof used["option"] !== "object" ? used["option"] : undefined,
        body:
          byFormatted === "id" ? { id: param } : { param, ...used["option"] },
      });

      return result;
    } catch (error) {
      console.log(`Hubo un error al usar el apiFetch ${error}`);
      return false;
    }
  };

  #getArtistParsed = async ({ prop }) => {
    const arrayArtistPromises = prop.map(async (artist) => {
      const result = await apiFetch({
        type: "artist",
        body: { id: artist.id },
      });

      return {
        id: artist.id,
        name: artist.name,
        genres: result.genres,
        popularity: result.popularity,
        image: result.images[2],
      };
    });
    const arrayArtist = await Promise.all(arrayArtistPromises);

    return arrayArtist;
  };

  #getTracksParsed = async ({ prop, genres }) => {
    const arrayTracksPromises = prop.map(async (track) => {
      const artistTracks = await this.#getArtistParsed({ prop: track.artists });

      return {
        id: track.id,
        duration: track.duration_ms / 60000,
        url_track: track.preview_url,
        name: track.name,
        artists: artistTracks,
        genres,
      };
    });

    const arrayTracks = await Promise.all(arrayTracksPromises);

    return arrayTracks;
  };

  #getGenres = async ({ id = false, album = false, arrayArtist }) => {
    try {
      let albumComplete = !id
        ? album
        : await apiFetch({ type: "albums", body: { id } });

      const tracks = albumComplete["tracks"]["items"];

      let genres =
        albumComplete["genres"]?.length > 0
          ? albumComplete["genres"]
          : arrayArtist.reduce((acc, artist) => [...acc, ...artist.genres], []);

      return { tracks, genres };
    } catch (error) {
      console.log(`Hubo un error al obtener los generos ${error.message}`);
      return new Error("Genero no encontrado");
    }
  };
}

export default Spotify;
