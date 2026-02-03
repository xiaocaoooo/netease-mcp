import { z } from 'zod';
import { api } from './api.js';

export const TOOLS = {
  search: {
    name: 'search',
    description: 'Search for songs, artists, albums, playlists, etc.',
    inputSchema: z.object({
      keywords: z.string().describe('The search keywords'),
      type: z
        .enum(['1', '10', '100', '1000', '1002', '1004', '1006', '1009', '1014', '1018', '2000'])
        .optional()
        .default('1')
        .describe(
          'Search type: 1: Song, 10: Album, 100: Artist, 1000: Playlist, 1002: User, 1004: MV, 1006: Lyric, 1009: DJ, 1014: Video, 1018: Composite, 2000: Voice',
        ),
      limit: z.number().optional().default(30).describe('Limit the number of results'),
      offset: z.number().optional().default(0).describe('Offset for pagination'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const type = parseInt(args.type || '1', 10);
      const res = await api.search(args.keywords, type, args.limit, args.offset, sessionId);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.body, null, 2) }],
      };
    },
  },
  get_song_detail: {
    name: 'get_song_detail',
    description: 'Get details for one or more songs',
    inputSchema: z.object({
      ids: z.array(z.number()).describe('Array of song IDs'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const idsStr = args.ids.join(',');
      const res = await api.getSongDetail(idsStr, sessionId);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.body, null, 2) }],
      };
    },
  },
  get_song_url: {
    name: 'get_song_url',
    description: 'Get the playback URL for a song',
    inputSchema: z.object({
      id: z.number().describe('The song ID'),
      level: z
        .enum([
          'standard',
          'higher',
          'exhigh',
          'lossless',
          'hires',
          'jyeffect',
          'sky',
          'dolby',
          'jymaster',
        ])
        .optional()
        .default('standard')
        .describe('Sound quality level'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const res = await api.getSongUrl(args.id, args.level, sessionId);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.body, null, 2) }],
      };
    },
  },
  get_unblocked_url: {
    name: 'get_unblocked_url',
    description: 'Get the playback URL for a song, attempting to unblock it if necessary',
    inputSchema: z.object({
      id: z.number().describe('The song ID'),
      level: z
        .enum([
          'standard',
          'higher',
          'exhigh',
          'lossless',
          'hires',
          'jyeffect',
          'sky',
          'dolby',
          'jymaster',
        ])
        .optional()
        .default('standard')
        .describe('Sound quality level'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const res = await api.getUnblockedUrl(args.id, args.level, sessionId);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.body, null, 2) }],
      };
    },
  },
  get_lyric: {
    name: 'get_lyric',
    description: 'Get lyrics for a song',
    inputSchema: z.object({
      id: z.number().describe('The song ID'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const res = await api.getLyric(args.id, sessionId);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.body, null, 2) }],
      };
    },
  },
  get_playlist: {
    name: 'get_playlist',
    description: 'Get playlist details and tracks',
    inputSchema: z.object({
      id: z.number().describe('The playlist ID'),
      limit: z.number().optional().default(1000).describe('Limit tracks'),
      offset: z.number().optional().default(0).describe('Offset tracks'),
    }),
    handler: async (args: any, sessionId?: string) => {
      // First get detail
      const detailRes = await api.getPlaylistDetail(args.id, sessionId);
      // Then get all tracks (because detail might truncate)
      const tracksRes = await api.getPlaylistTracks(args.id, args.limit, args.offset, sessionId);

      const result = {
        playlist: detailRes.body,
        tracks: tracksRes.body,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  get_album: {
    name: 'get_album',
    description: 'Get album details and songs',
    inputSchema: z.object({
      id: z.number().describe('The album ID'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const res = await api.getAlbum(args.id, sessionId);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.body, null, 2) }],
      };
    },
  },
  get_artist: {
    name: 'get_artist',
    description: 'Get artist details and top songs',
    inputSchema: z.object({
      id: z.number().describe('The artist ID'),
    }),
    handler: async (args: any, sessionId?: string) => {
      const detailRes = await api.getArtistDetail(args.id, sessionId);
      const topSongsRes = await api.getArtistTopSongs(args.id, sessionId);

      const result = {
        artist: detailRes.body,
        topSongs: topSongsRes.body,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  },
};
