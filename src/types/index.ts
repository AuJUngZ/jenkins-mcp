export interface BuildStatus {
  building: boolean;
  result: string | null;
  timestamp: number;
  duration: number;
  url: string;
}

export interface BuildParameter {
  name: string;
  value: any;
}

export interface BuildInfo extends BuildStatus {
  number: number;
  parameters?: Record<string, any>;
}

export interface JobResult {
  jobPath: string;
  status: "success" | "error";
  data?: any;
  error?: string;
}

export interface ToolArguments {
  [key: string]: any;
}

export interface BuildTriggerArgs extends ToolArguments {
  jobPath: string;
  parameters?: Record<string, string>;
}

export interface BuildStatusArgs extends ToolArguments {
  jobPaths: string[];
  buildNumbers: string[];
}

export interface BuildLogArgs extends ToolArguments {
  jobPath: string;
  buildNumber: string;
}

export interface BuildParamsArgs extends ToolArguments {
  jobPaths: string[];
  buildNumbers?: string[];
}
