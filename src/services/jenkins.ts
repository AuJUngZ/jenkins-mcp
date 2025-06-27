import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "../config/index.js";
import { BuildStatus, BuildInfo, JobResult } from "../types/index.js";

export class JenkinsService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.jenkins.url,
      auth: {
        username: config.jenkins.user,
        password: config.jenkins.token,
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Add request interceptor for debugging in development
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.error(
          `[Jenkins API] ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Format job path to Jenkins API format
   */
  public formatJobPath(jobPath: string): string {
    if (jobPath.startsWith("job/")) {
      return jobPath;
    }

    const segments = jobPath.split("/");
    return "job/" + segments.join("/job/");
  }

  /**
   * Get build status for a specific job and build number
   */
  public async getBuildStatus(
    jobPath: string,
    buildNumber: string
  ): Promise<BuildStatus> {
    const formattedJobPath = this.formatJobPath(jobPath);
    const response = await this.axiosInstance.get<BuildStatus>(
      `/${formattedJobPath}/${buildNumber}/api/json`
    );
    return response.data;
  }

  /**
   * Trigger a new build for a job
   */
  public async triggerBuild(
    jobPath: string,
    parameters?: Record<string, string>
  ): Promise<void> {
    const formattedJobPath = this.formatJobPath(jobPath);
    const params = new URLSearchParams();

    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }

    await this.axiosInstance.post(
      `/${formattedJobPath}/buildWithParameters`,
      params
    );
  }

  /**
   * Get console log for a specific build
   */
  public async getBuildLog(
    jobPath: string,
    buildNumber: string
  ): Promise<string> {
    const formattedJobPath = this.formatJobPath(jobPath);
    const response = await this.axiosInstance.get(
      `/${formattedJobPath}/${buildNumber}/consoleText`
    );
    return response.data;
  }

  /**
   * Get the latest successful build information
   */
  public async getLatestSuccessfulBuild(jobPath: string): Promise<BuildInfo> {
    const formattedJobPath = this.formatJobPath(jobPath);
    const response = await this.axiosInstance.get(
      `/${formattedJobPath}/lastSuccessfulBuild/api/json`
    );
    return response.data;
  }

  /**
   * Get build parameters for a specific build
   */
  public async getBuildParameters(
    jobPath: string,
    buildNumber: string
  ): Promise<Record<string, any>> {
    const formattedJobPath = this.formatJobPath(jobPath);
    const response = await this.axiosInstance.get(
      `/${formattedJobPath}/${buildNumber}/api/json?tree=actions[parameters[*]]`
    );

    const parameters = response.data.actions
      .find((action: any) => action?.parameters)
      ?.parameters.reduce((acc: any, param: any) => {
        acc[param.name] = param.value;
        return acc;
      }, {});

    return parameters || {};
  }

  /**
   * Handle axios errors and convert them to readable messages
   */
  public handleError(error: unknown, defaultMessage: string): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return `Jenkins API error: ${axiosError.response?.status} ${
        axiosError.response?.statusText || axiosError.message
      }`;
    } else if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  }

  /**
   * Check if error is a 404 (not found)
   */
  public isNotFoundError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 404;
  }
}
