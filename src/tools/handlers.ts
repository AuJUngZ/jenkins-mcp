import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { JenkinsService } from "../services/jenkins.js";
import {
  BuildStatusArgs,
  BuildTriggerArgs,
  BuildLogArgs,
  BuildParamsArgs,
  ToolArguments,
} from "../types/index.js";
import {
  validateArraysLength,
  validateNonEmptyArray,
  formatMcpResponse,
  processJobOperations,
} from "../utils/validation.js";

export class ToolHandlers {
  constructor(private jenkinsService: JenkinsService) {}

  async handleGetBuildStatus(args: BuildStatusArgs) {
    const { jobPaths, buildNumbers } = args;

    validateNonEmptyArray(jobPaths, "jobPaths");
    validateNonEmptyArray(buildNumbers, "buildNumbers");
    validateArraysLength(jobPaths, buildNumbers, "jobPaths", "buildNumbers");

    const results = await processJobOperations(
      jobPaths,
      async (jobPath, index) => {
        const buildNumber = buildNumbers[index];
        try {
          const data = await this.jenkinsService.getBuildStatus(
            jobPath,
            buildNumber
          );
          return {
            jobPath,
            status: "success",
            data: {
              building: data.building,
              result: data.result,
              timestamp: data.timestamp,
              duration: data.duration,
              url: data.url,
            },
          };
        } catch (error) {
          const errorMessage = this.jenkinsService.handleError(
            error,
            "Failed to get build status"
          );
          return {
            jobPath,
            status: "error",
            error: errorMessage,
          };
        }
      }
    );

    return formatMcpResponse(results);
  }

  async handleTriggerBuild(args: BuildTriggerArgs) {
    const { jobPath, parameters = {} } = args;

    if (!jobPath || typeof jobPath !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        "jobPath must be a non-empty string"
      );
    }

    try {
      await this.jenkinsService.triggerBuild(jobPath, parameters);
      return formatMcpResponse(
        `Build triggered successfully for job: ${jobPath}. Check Jenkins for status.`
      );
    } catch (error) {
      const errorMessage = this.jenkinsService.handleError(
        error,
        "Failed to trigger build"
      );
      throw new McpError(ErrorCode.InternalError, errorMessage);
    }
  }

  async handleGetBuildLog(args: BuildLogArgs) {
    const { jobPath, buildNumber } = args;

    if (!jobPath || typeof jobPath !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        "jobPath must be a non-empty string"
      );
    }
    if (!buildNumber || typeof buildNumber !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        "buildNumber must be a non-empty string"
      );
    }

    try {
      const log = await this.jenkinsService.getBuildLog(jobPath, buildNumber);
      return formatMcpResponse(log);
    } catch (error) {
      const errorMessage = this.jenkinsService.handleError(
        error,
        "Failed to get build log"
      );
      throw new McpError(ErrorCode.InternalError, errorMessage);
    }
  }

  async handleGetLatestSuccessBuildParams(args: { jobPaths: string[] }) {
    const { jobPaths } = args;

    validateNonEmptyArray(jobPaths, "jobPaths");

    const results = await processJobOperations(jobPaths, async (jobPath) => {
      try {
        const buildInfo = await this.jenkinsService.getLatestSuccessfulBuild(
          jobPath
        );
        const parameters = await this.jenkinsService.getBuildParameters(
          jobPath,
          buildInfo.number.toString()
        );

        return {
          jobPath,
          status: "success",
          data: {
            buildNumber: buildInfo.number,
            url: buildInfo.url,
            timestamp: buildInfo.timestamp,
            parameters,
          },
        };
      } catch (error) {
        if (this.jenkinsService.isNotFoundError(error)) {
          return {
            jobPath,
            status: "success",
            data: { message: "No successful build found." },
          };
        }

        const errorMessage = this.jenkinsService.handleError(
          error,
          "Failed to get latest successful build params"
        );
        return {
          jobPath,
          status: "error",
          error: errorMessage,
        };
      }
    });

    return formatMcpResponse(results);
  }

  async handleGetBuildParams(args: BuildParamsArgs) {
    const { jobPaths, buildNumbers } = args;

    validateNonEmptyArray(jobPaths, "jobPaths");
    validateNonEmptyArray(buildNumbers, "buildNumbers");
    validateArraysLength(jobPaths, buildNumbers!, "jobPaths", "buildNumbers");

    const results = await processJobOperations(
      jobPaths,
      async (jobPath, index) => {
        const buildNumber = buildNumbers![index];
        try {
          const buildInfo = await this.jenkinsService.getBuildStatus(
            jobPath,
            buildNumber
          );
          const parameters = await this.jenkinsService.getBuildParameters(
            jobPath,
            buildNumber
          );

          return {
            jobPath,
            status: "success",
            data: {
              buildNumber,
              url: buildInfo.url,
              result: buildInfo.result,
              building: buildInfo.building,
              timestamp: buildInfo.timestamp,
              duration: buildInfo.duration,
              parameters,
            },
          };
        } catch (error) {
          if (this.jenkinsService.isNotFoundError(error)) {
            return {
              jobPath,
              status: "error",
              error: `Build #${buildNumber} not found for job.`,
            };
          }

          const errorMessage = this.jenkinsService.handleError(
            error,
            "Failed to get build params"
          );
          return {
            jobPath,
            status: "error",
            error: errorMessage,
          };
        }
      }
    );

    return formatMcpResponse(results);
  }
}
