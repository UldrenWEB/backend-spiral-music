"use strict";
import { apiFetch } from "../services/apiFetch.js";

class Spotify {
  constructor() {}

  getTracks = async ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();

    const option = {
      name: { type: "search", search: "track" },
      id: { type: "tracks" },
    };

    const result = await this.#useApiFetch({
      by: byFormatted,
      limit,
      offset,
      options: option,
      param: param,
    });
    try {
      let theTracks = [];

      if (byFormatted === "name") {
        const arrayTracks = result["tracks"]["items"];

        const tracks = await this.#getTracksParsed({
          prop: arrayTracks,
        });

        theTracks = tracks;
      } else if (byFormatted === "id") {
        const track = await this.#getTracksParsed({ prop: result });

        theTracks.push(track[0]);
      }

      return theTracks.length > 1 ? theTracks : theTracks[0];
    } catch (error) {
      console.log(`Hubo un error al obtener canciones ${error}`);
      return { error: error.message };
    }
  };

  //Obtener albums por id o por nombre
  getAlbums = async ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();

    const option = {
      name: { type: "search", search: "album" },
      id: { type: "albums", search: "tracks" },
    };

    const result = await this.#useApiFetch({
      by: byFormatted,
      limit,
      offset,
      options: option,
      param: param,
    });
    try {
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
            imageUrl: album.images[0].url,
          });

          const obj = {
            id: album.id,
            name: album.name,
            image: album.images[0].url,
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
          image: result.images[2].url,
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
        image: result.images[2].url,
      };
    });
    const arrayArtist = await Promise.all(arrayArtistPromises);

    return arrayArtist;
  };

  #getTracksParsed = async ({ prop, genres, imageUrl }) => {
    const arrayProp = Array.isArray(prop) ? prop : [prop];

    const arrayTracksPromises = arrayProp.map(async (track) => {
      const artistTracks = await this.#getArtistParsed({ prop: track.artists });
      return {
        id: track.id,
        duration: track.duration_ms / 60000,
        url_track: track.preview_url,
        name: track.name,
        artists: artistTracks,
        image: !imageUrl ? track?.album?.images[0].url : imageUrl,
        genres: !genres
          ? artistTracks.reduce((acc, artist) => [...acc, ...artist.genres], [])
          : genres,
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
