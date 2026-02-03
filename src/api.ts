import {
  cloudsearch,
  song_detail,
  song_url_v1,
  lyric_new,
  playlist_detail,
  playlist_track_all,
  album,
  artist_detail,
  artist_top_song,
  // @ts-expect-error register_anonimous is not in the type definition but exists in runtime
  register_anonimous,
} from '@neteasecloudmusicapienhanced/api';

// Map to store session-specific cookies
const sessionCookies = new Map<string, string>();

let globalCookie: string = '';

export const setGlobalCookie = (cookie: string) => {
  globalCookie = cookie;
};

export const getCookie = (sessionId?: string): string => {
  if (sessionId && sessionCookies.has(sessionId)) {
    return sessionCookies.get(sessionId)!;
  }
  return globalCookie;
};

export const setSessionCookie = (sessionId: string, cookie: string) => {
  sessionCookies.set(sessionId, cookie);
};

export const initAnonymousCookie = async () => {
  try {
    const res = await register_anonimous({});
    if (res.body && res.body.cookie) {
      console.log('Initialized anonymous cookie');
      globalCookie = res.body.cookie as string;
    }
  } catch (error) {
    console.warn('Failed to initialize anonymous cookie:', error);
  }
};

interface ApiOptions {
  cookie?: string;
  [key: string]: any;
}

// Wrapper to inject cookie
const withCookie = (options: ApiOptions, sessionId?: string): any => {
  return {
    ...options,
    cookie: options.cookie || getCookie(sessionId),
  };
};

export const api = {
  search: async (
    keywords: string,
    type: number,
    limit: number,
    offset: number,
    sessionId?: string,
  ) => {
    return cloudsearch(withCookie({ keywords, type, limit, offset }, sessionId));
  },
  getSongDetail: async (ids: string, sessionId?: string) => {
    return song_detail(withCookie({ ids }, sessionId));
  },
  getSongUrl: async (id: string | number, level: string, sessionId?: string) => {
    return song_url_v1(withCookie({ id, level }, sessionId));
  },
  getUnblockedUrl: async (id: string | number, level: string, sessionId?: string) => {
    return song_url_v1(withCookie({ id, level, unblock: true }, sessionId));
  },
  getLyric: async (id: string | number, sessionId?: string) => {
    return lyric_new(withCookie({ id }, sessionId));
  },
  getPlaylistDetail: async (id: string | number, sessionId?: string) => {
    return playlist_detail(withCookie({ id }, sessionId));
  },
  getPlaylistTracks: async (
    id: string | number,
    limit: number,
    offset: number,
    sessionId?: string,
  ) => {
    return playlist_track_all(withCookie({ id, limit, offset }, sessionId));
  },
  getAlbum: async (id: string | number, sessionId?: string) => {
    return album(withCookie({ id }, sessionId));
  },
  getArtistDetail: async (id: string | number, sessionId?: string) => {
    return artist_detail(withCookie({ id }, sessionId));
  },
  getArtistTopSongs: async (id: string | number, sessionId?: string) => {
    return artist_top_song(withCookie({ id }, sessionId));
  },
};
