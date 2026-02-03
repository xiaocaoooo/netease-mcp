import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TOOLS } from './tools.js';

export const createServer = (sessionId: string) => {
  const server = new Server(
    {
      name: 'netease-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.values(TOOLS).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = TOOLS[toolName as keyof typeof TOOLS];

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    // Validate arguments using Zod
    const args = tool.inputSchema.parse(request.params.arguments);

    // Call handler with sessionId to lookup cookie
    return tool.handler(args, sessionId);
  });

  return server;
};
