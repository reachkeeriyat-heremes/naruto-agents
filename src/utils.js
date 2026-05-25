/**
 * UTILITY FUNCTIONS
 * Shared helpers for logging, error handling, and formatting
 */

export function formatTime(date = new Date()) {
  return date.toISOString();
}

export function formatLogMessage(agentName, message, priority = 'INFO') {
  return `[${formatTime()}] [${priority}] [${agentName}] ${message}`;
}

// ============================================
// ERROR HANDLING
// ============================================
export function handleError(error, context = {}) {
  const errorLog = {
    timestamp: formatTime(),
    message: error.message,
    stack: error.stack,
    context,
  };

  console.error(JSON.stringify(errorLog, null, 2));
  return errorLog;
}

export async function retryWithBackoff(fn, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const waitTime = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(`Attempt ${attempt} failed. Retrying in ${waitTime}ms...`, error.message);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// ============================================
// VALIDATION
// ============================================
export function validateEnv(requiredVars) {
  const missing = [];
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

export function validateNotionDatabases(databaseIds) {
  const invalid = [];
  Object.entries(databaseIds).forEach(([name, id]) => {
    if (!id || typeof id !== 'string' || id.length !== 36) {
      invalid.push(`${name}: invalid format`);
    }
  });

  if (invalid.length > 0) {
    throw new Error(`Invalid Notion database IDs:\n${invalid.join('\n')}`);
  }
}

// ============================================
// NOTIFICATION HELPERS
// ============================================
export async function sendSlackNotification(webhookUrl, message) {
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured. Skipping notification.');
    return null;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message.summary || message,
        attachments:
          message.details && message.priority
            ? [
                {
                  color: message.priority === 'P0' ? 'danger' : 'warning',
                  fields: [
                    {
                      title: 'Priority',
                      value: message.priority,
                      short: true,
                    },
                    {
                      title: 'Agent',
                      value: message.agent || 'Unknown',
                      short: true,
                    },
                    {
                      title: 'Details',
                      value: message.details,
                      short: false,
                    },
                  ],
                  ts: Math.floor(Date.now() / 1000),
                },
              ]
            : undefined,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
}

// ============================================
// CONTEXT BUILDERS
// ============================================
export function buildExecutionContext(timestamp = new Date()) {
  const hour = timestamp.getHours();
  const day = timestamp.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isBusinessHours = hour >= 9 && hour < 17;

  return {
    timestamp,
    hour,
    day,
    isWeekday,
    isBusinessHours,
    dayName: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][day],
  };
}

export function getPriorityColor(priority) {
  const colors = {
    'P0': '🔴',
    'P1': '🟠',
    'P2': '🟡',
    'P3': '🟢',
  };
  return colors[priority] || '⚪';
}

// ============================================
// BATCH PROCESSING
// ============================================
export async function processBatch(items, processFn, batchSize = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
  }
  return results;
}

// ============================================
// JSON FORMATTING
// ============================================
export function formatJSON(obj, pretty = true) {
  return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
}

export function parseJSON(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
}

export default {
  formatTime,
  formatLogMessage,
  handleError,
  retryWithBackoff,
  validateEnv,
  validateNotionDatabases,
  sendSlackNotification,
  buildExecutionContext,
  getPriorityColor,
  processBatch,
  formatJSON,
  parseJSON,
};
