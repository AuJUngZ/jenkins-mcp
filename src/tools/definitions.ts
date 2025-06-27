export const TOOL_DEFINITIONS = [
  {
    name: "get_build_status",
    description: "Get the status of one or more Jenkins builds",
    inputSchema: {
      type: "object",
      properties: {
        jobPaths: {
          type: "array",
          items: { type: "string" },
          description:
            'List of paths to the Jenkins jobs (e.g., ["view/xxx_debug", "folder/my_job"])',
        },
        buildNumbers: {
          type: "array",
          items: { type: "string" },
          description:
            'List of build numbers (use "lastBuild" for most recent). Must match the length and order of jobPaths.',
        },
      },
      required: ["jobPaths", "buildNumbers"],
    },
  },
  {
    name: "trigger_build",
    description: "Trigger a new Jenkins build",
    inputSchema: {
      type: "object",
      properties: {
        jobPath: {
          type: "string",
          description: "Path to the Jenkins job",
        },
        parameters: {
          type: "object",
          description: "Build parameters (optional)",
          additionalProperties: {
            type: "string",
            description: "Parameter value",
          },
        },
      },
      required: ["jobPath"],
    },
  },
  {
    name: "get_build_log",
    description: "Get the console output of a Jenkins build",
    inputSchema: {
      type: "object",
      properties: {
        jobPath: {
          type: "string",
          description: "Path to the Jenkins job",
        },
        buildNumber: {
          type: "string",
          description: 'Build number (use "lastBuild" for most recent)',
        },
      },
      required: ["jobPath", "buildNumber"],
    },
  },
  {
    name: "get_latest_success_build_params",
    description:
      "Get parameters from the latest successful build for one or more jobs",
    inputSchema: {
      type: "object",
      properties: {
        jobPaths: {
          type: "array",
          items: { type: "string" },
          description: "List of paths to the Jenkins jobs",
        },
      },
      required: ["jobPaths"],
    },
  },
  {
    name: "get_build_params",
    description:
      "Get parameters and status from a specific build for one or more jobs",
    inputSchema: {
      type: "object",
      properties: {
        jobPaths: {
          type: "array",
          items: { type: "string" },
          description: "List of paths to the Jenkins jobs",
        },
        buildNumbers: {
          type: "array",
          items: { type: "string" },
          description:
            "List of build numbers to get parameters from. Must match the length and order of jobPaths.",
        },
      },
      required: ["jobPaths", "buildNumbers"],
    },
  },
] as const;
