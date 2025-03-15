/**
 * Safely parses a response as JSON, handling non-JSON responses gracefully
 * @param response The fetch Response object
 * @returns A promise that resolves to the parsed JSON or an error object
 */
export async function safeParseJSON(response: Response) {
  try {
    // Check if the response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      // If not JSON, get the text and log it
      const text = await response.text();
      console.error("Non-JSON response:", text);
      return { 
        success: false, 
        error: "Server returned non-JSON response", 
        details: text 
      };
    }
  } catch (parseError) {
    console.error("Error parsing response:", parseError);
    return { 
      success: false, 
      error: "Failed to parse server response",
      details: parseError instanceof Error ? parseError.message : String(parseError)
    };
  }
}

/**
 * Makes an API request with proper error handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns A promise that resolves to the parsed response or an error object
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    const data = await safeParseJSON(response);
    
    if (!response.ok) {
      console.error("API Error:", data);
      return { 
        success: false, 
        error: data.error || `Request failed with status ${response.status}`,
        details: data
      };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("API request error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error",
      details: err
    };
  }
} 