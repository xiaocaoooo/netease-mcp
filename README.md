# netease-mcp

A Model Context Protocol (MCP) server that provides access to the Netease Cloud Music API. This server enables AI assistants (like Claude) to search for music, retrieve song details, lyrics, playlists, albums, and artists from Netease Cloud Music.

## Features

This MCP server exposes the following tools:

- **`search`**: Search for songs, artists, albums, playlists, users, MVs, lyrics, etc.
- **`get_song_detail`**: Get detailed metadata for one or more songs.
- **`get_song_url`**: Get the playback URL for a song. Supports various quality levels (standard, higher, exhigh, lossless, hires, etc.).
- **`get_unblocked_url`**: specific version of `get_song_url` that attempts to unblock songs (e.g., greyed out tracks) if possible.
- **`get_lyric`**: Fetch lyrics for a song.
- **`get_playlist`**: Retrieve playlist details and its full tracklist.
- **`get_album`**: Get album details and included songs.
- **`get_artist`**: Get artist details and their top 50 songs.

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd netease-mcp
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Build the project:
    ```bash
    pnpm build
    ```

## Configuration

You can configure the server using environment variables. Create a `.env` file in the root directory:

```env
PORT=3000
NETEASE_COOKIE=your_netease_cookie_here  # Optional: For accessing VIP/User-specific data
```

- **`PORT`**: The port the server listens on (default: `3000`).
- **`NETEASE_COOKIE`**: Your Netease Cloud Music cookie. If not provided, the server will attempt to initialize an anonymous cookie. Providing a cookie allows access to higher quality audio and user-specific data.

### Authentication

The server supports two levels of authentication:

1.  **Global Cookie**: Set via the `NETEASE_COOKIE` environment variable. This is used for all requests if no session-specific cookie is provided.
2.  **Session Cookie**: You can pass a cookie via the `Authorization` header (`Bearer <cookie>`) when connecting to the SSE endpoint. This allows for per-user authentication in a multi-user environment.

## Usage

### Running the Server

Start the server normally:

```bash
pnpm start
```

For development with hot-reload:

```bash
pnpm dev
```

The server runs an SSE (Server-Sent Events) endpoint at:
`http://localhost:3000/sse`

### Using with Claude Desktop

To use this with Claude Desktop, add the following configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "netease-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/netease-mcp/dist/index.js"],
      "env": {
        "NETEASE_COOKIE": "optional_cookie_string"
      }
    }
  }
}
```

_Note: Since this is an SSE-based MCP server, using it directly via command execution (stdio) might require an adapter or direct support in the client. However, the current implementation primarily exposes an HTTP/SSE server. If you need stdio support, you might need to adjust `src/index.ts` to use `StdioServerTransport` instead of `SSEServerTransport` and `express`._

**Correction for Local Usage:**
The current code in `src/index.ts` sets up an Express server with SSE. Most local MCP clients (like Claude Desktop) communicate via Stdio by default. If you intend to use this via `mcp-inspector` or a remote client, the SSE setup is perfect.

## Development

- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`

## License

ISC
