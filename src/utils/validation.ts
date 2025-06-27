import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Validate that arrays have the same length
 */
export function validateArraysLength(
  array1: any[],
  array2: any[],
  name1: string,
  name2: string
): void {
  if (array1.length !== array2.length) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${name1} and ${name2} arrays must have the same length.`
    );
  }
}

/**
 * Validate that an array is non-empty
 */
export function validateNonEmptyArray(array: any, name: string): void {
  if (!Array.isArray(array) || array.length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${name} must be a non-empty array.`
    );
  }
}

/**
 * Format results for MCP response
 */
export function formatMcpResponse(data: any): {
  content: { type: string; text: string }[];
} {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Process multiple async operations and handle errors gracefully
 */
export async function processJobOperations<T>(
  jobPaths: string[],
  operation: (jobPath: string, index: number) => Promise<T>
): Promise<any[]> {
  const results = await Promise.allSettled(
    jobPaths.map((jobPath, index) => operation(jobPath, index))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        jobPath: jobPaths[index],
        status: "error",
        error: result.reason?.message || "Unknown error occurred",
      };
    }
  });
}
