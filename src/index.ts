#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { config } from "./config/index.js";
import { JenkinsService } from "./services/jenkins.js";
import { ToolHandlers } from "./tools/handlers.js";
import { TOOL_DEFINITIONS } from "./tools/definitions.js";

class JenkinsServer {
  private server: Server;
  private jenkinsService: JenkinsService;
  private toolHandlers: ToolHandlers;

  constructor() {
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.jenkinsService = new JenkinsService();
    this.toolHandlers = new ToolHandlers(this.jenkinsService);

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOL_DEFINITIONS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments || {};
        switch (request.params.name) {
          case "get_build_status":
            return await this.toolHandlers.handleGetBuildStatus(args as any);
          case "trigger_build":
            return await this.toolHandlers.handleTriggerBuild(args as any);
          case "get_build_log":
            return await this.toolHandlers.handleGetBuildLog(args as any);
          case "get_latest_success_build_params":
            return await this.toolHandlers.handleGetLatestSuccessBuildParams(
              args as any
            );
          case "get_build_params":
            return await this.toolHandlers.handleGetBuildParams(args as any);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        console.error("[Tool Error]", error);
        throw new McpError(
          ErrorCode.InternalError,
          "An unexpected error occurred"
        );
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => console.error("[MCP Error]", error);

    process.on("SIGINT", async () => {
      console.error("Shutting down Jenkins MCP server...");
      await this.server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.error("Shutting down Jenkins MCP server...");
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error(
        `Jenkins MCP server running on stdio (${config.server.name} v${config.server.version})`
      );
    } catch (error) {
      console.error("Failed to start Jenkins MCP server:", error);
      process.exit(1);
    }
  }
}

// Start the server
async function main() {
  try {
    const server = new JenkinsServer();
    await server.run();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
