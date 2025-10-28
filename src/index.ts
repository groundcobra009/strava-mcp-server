#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  average_speed: number;
  max_speed: number;
}

interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  weight: number;
}

class StravaAPI {
  private accessToken: string = "";
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID || "";
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || "";
    this.refreshToken = process.env.STRAVA_REFRESH_TOKEN || "";

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error("Missing required Strava credentials in environment variables");
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post<StravaTokenResponse>(
        "https://www.strava.com/oauth/token",
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: "refresh_token",
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiresAt = response.data.expires_at;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error}`);
    }
  }

  private async ensureValidToken(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    if (!this.accessToken || now >= this.tokenExpiresAt - 300) {
      await this.refreshAccessToken();
    }
  }

  async getAthleteActivities(
    page: number = 1,
    perPage: number = 30
  ): Promise<StravaActivity[]> {
    await this.ensureValidToken();

    const response = await axios.get<StravaActivity[]>(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          page,
          per_page: perPage,
        },
      }
    );

    return response.data;
  }

  async getActivity(activityId: number): Promise<StravaActivity> {
    await this.ensureValidToken();

    const response = await axios.get<StravaActivity>(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    return response.data;
  }

  async getAthlete(): Promise<StravaAthlete> {
    await this.ensureValidToken();

    const response = await axios.get<StravaAthlete>(
      "https://www.strava.com/api/v3/athlete",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    return response.data;
  }

  async getAthleteStats(athleteId: number): Promise<any> {
    await this.ensureValidToken();

    const response = await axios.get(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    return response.data;
  }
}

const stravaAPI = new StravaAPI();

const TOOLS: Tool[] = [
  {
    name: "get_activities",
    description:
      "アスリートのアクティビティ一覧を取得します。ページネーションに対応しています。",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "number",
          description: "ページ番号（デフォルト: 1）",
          default: 1,
        },
        per_page: {
          type: "number",
          description: "1ページあたりの件数（デフォルト: 30、最大: 200）",
          default: 30,
        },
      },
    },
  },
  {
    name: "get_activity",
    description: "特定のアクティビティの詳細情報を取得します。",
    inputSchema: {
      type: "object",
      properties: {
        activity_id: {
          type: "number",
          description: "取得するアクティビティのID",
        },
      },
      required: ["activity_id"],
    },
  },
  {
    name: "get_athlete",
    description: "認証されたアスリートのプロフィール情報を取得します。",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_athlete_stats",
    description: "アスリートの統計情報（総距離、総時間など）を取得します。",
    inputSchema: {
      type: "object",
      properties: {
        athlete_id: {
          type: "number",
          description: "アスリートのID",
        },
      },
      required: ["athlete_id"],
    },
  },
];

const server = new Server(
  {
    name: "strava-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_activities": {
        const page = (args?.page as number) || 1;
        const perPage = (args?.per_page as number) || 30;
        const activities = await stravaAPI.getAthleteActivities(page, perPage);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(activities, null, 2),
            },
          ],
        };
      }

      case "get_activity": {
        const activityId = args?.activity_id as number;
        if (!activityId) {
          throw new Error("activity_id is required");
        }
        const activity = await stravaAPI.getActivity(activityId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(activity, null, 2),
            },
          ],
        };
      }

      case "get_athlete": {
        const athlete = await stravaAPI.getAthlete();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(athlete, null, 2),
            },
          ],
        };
      }

      case "get_athlete_stats": {
        const athleteId = args?.athlete_id as number;
        if (!athleteId) {
          throw new Error("athlete_id is required");
        }
        const stats = await stravaAPI.getAthleteStats(athleteId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Strava MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
