import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export interface Config {
  jenkins: {
    url: string;
    user: string;
    token: string;
  };
  server: {
    name: string;
    version: string;
  };
}

class ConfigValidator {
  private static validateRequired(
    value: string | undefined,
    name: string
  ): string {
    if (!value || value.trim() === "") {
      throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value.trim();
  }

  private static validateUrl(url: string): string {
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error(`Invalid URL format for JENKINS_URL: ${url}`);
    }
  }

  public static validate(): Config {
    const jenkinsUrl = this.validateRequired(
      process.env.JENKINS_URL,
      "JENKINS_URL"
    );
    const jenkinsUser = this.validateRequired(
      process.env.JENKINS_USER,
      "JENKINS_USER"
    );
    const jenkinsToken = this.validateRequired(
      process.env.JENKINS_TOKEN,
      "JENKINS_TOKEN"
    );

    return {
      jenkins: {
        url: this.validateUrl(jenkinsUrl),
        user: jenkinsUser,
        token: jenkinsToken,
      },
      server: {
        name: process.env.SERVER_NAME || "jenkins-server",
        version: process.env.SERVER_VERSION || "0.1.0",
      },
    };
  }
}

export const config = ConfigValidator.validate();
