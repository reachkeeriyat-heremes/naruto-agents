/**
 * NARUTO AGENTS SYSTEM - CONSTANTS
 * All configuration values for the 6-agent crew
 */

// ============================================
// NOTION DATABASE IDs (FROM YOUR WORKSPACE)
// ============================================
export const NOTION_DATABASES = {
  ACTIVITY_STREAM: 'e6a478b7-9274-410e-9bb3-4f61c34f1037',
  TASKS: '19893e20-d7fa-47d1-bd96-69b29e05c586',
  PROJECTS: 'edb5814f-f67e-4159-94a5-408e360f56e3',
  GOALS_MILESTONES: '9340cf10-889c-4831-8dcd-6f346b4ba52d',
  KNOWLEDGE_BASE: '58c89112-b9bf-4ce0-a8ac-782eb091f669',
  DAILY_EXECUTION_LOG: '2fd4f462-d509-479f-a695-aa13c9c54bbf',
};

// ============================================
// ESCALATION THRESHOLDS (YOUR CALIBRATION)
// ============================================
export const THRESHOLDS = {
  // ITACHI: Email Processing
  EMAIL_QUEUE_THRESHOLD: 50,  // Items in inbox before batch processing
  EMAIL_BATCH_SIZE: 25,       // Process in chunks of 25

  // KAKASHI: Blocker Detection
  BLOCKER_THRESHOLD: 1,       // Alert immediately if any blocker detected
  BLOCKER_ESCALATION_PRIORITY: 'P0',

  // NARUTO: Revenue Monitoring
  REVENUE_TARGET: 90000,      // $90k/month from Goals database
  REVENUE_DROP_THRESHOLD: 10, // Alert at 10% drop (not 5%)
  REVENUE_ALERT_AMOUNT: 9000, // $9k drop from $90k baseline

  // ZABUZA: Response Rate Monitoring
  RESPONSE_RATE_TARGET: 5,    // Healthy B2B response rate is 5%+
  RESPONSE_RATE_THRESHOLD: 4, // Alert if below 4%
  RESPONSE_RATE_CHECK_WINDOW_DAYS: 7, // Check last 7 days of outreach
};

// ============================================
// AGENT CONFIGURATION
// ============================================
export const AGENTS = {
  KAKASHI: {
    name: 'Kakashi',
    role: 'Orchestrator & Blocker Detection',
    color: 'blue',
    responsibilities: [
      'Morning agenda prioritization',
      'Blocker escalation (any blocker = P0)',
      'Task prioritization via Eisenhower Matrix',
      'Daily standup creation',
    ],
    escalation_trigger: `Detects >= ${THRESHOLDS.BLOCKER_THRESHOLD} active blocker(s)`,
  },
  JIRAIYA: {
    name: 'Jiraiya',
    role: 'Mental Health & Energy Diagnostician',
    color: 'purple',
    responsibilities: [
      '7 daily mindset questions',
      'Energy level diagnosis',
      'Business friction anticipation',
      'Stress metrics tracking',
    ],
    escalation_trigger: 'Energy drops below threshold or friction detected',
  },
  ITACHI: {
    name: 'Itachi',
    role: 'Email Personalization & Outreach',
    color: 'red',
    responsibilities: [
      'Cold email hook design',
      'Prospect angle analysis',
      'Tone matching per recipient',
      'Email campaign sequencing',
    ],
    escalation_trigger: `Email queue exceeds ${THRESHOLDS.EMAIL_QUEUE_THRESHOLD} items`,
  },
  MIGHT_GUY: {
    name: 'Might Guy',
    role: 'Content Strategy & Social Coordination',
    color: 'orange',
    responsibilities: [
      'Daily content briefs',
      'Multi-platform strategy (Twitter, LinkedIn, Instagram, TikTok, Reels)',
      'Content calendar management',
      'Engagement metrics tracking',
    ],
    escalation_trigger: 'Content pipeline stalls or engagement drops',
  },
  ZABUZA: {
    name: 'Zabuza',
    role: 'Cold Outreach Decision Maker',
    color: 'gray',
    responsibilities: [
      'Reply rate analysis',
      'Send/pause decisions',
      'Campaign performance review',
      'Lead quality assessment',
    ],
    escalation_trigger: `Response rate drops below ${THRESHOLDS.RESPONSE_RATE_THRESHOLD}%`,
  },
  NARUTO: {
    name: 'Naruto',
    role: 'Revenue Intelligence & Growth',
    color: 'yellow',
    responsibilities: [
      'Revenue metrics every 6 hours',
      'Growth data interpretation',
      'Strategic insights synthesis',
      'Opportunity identification',
    ],
    escalation_trigger: `Revenue drops > ${THRESHOLDS.REVENUE_DROP_THRESHOLD}% from $${THRESHOLDS.REVENUE_TARGET}`,
  },
};

// ============================================
// CLAUDE API CONFIGURATION
// ============================================
export const CLAUDE_CONFIG = {
  MODEL: 'claude-opus-4-7',  // Latest, most capable model
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
};

// ============================================
// POLLING & TIMING
// ============================================
export const TIMING = {
  POLLING_INTERVAL_MINUTES: 30,
  KAKASHI_SCHEDULE: '08:00',  // Morning agenda at 8am
  JIRAIYA_SCHEDULE: '09:00',  // Mindset check at 9am
  MIGHT_GUY_SCHEDULE: '12:00', // Content brief at noon
  NARUTO_CHECK_FREQUENCY: '6h', // Every 6 hours (0am, 6am, noon, 6pm)
  ZABUZA_SCHEDULE: '12:00',   // Cold outreach review at noon
  END_OF_DAY: '17:00',        // 5pm standup
};

// ============================================
// NOTIFICATIONS (OPTIONAL)
// ============================================
export const NOTIFICATIONS = {
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || null, // Optional Slack integration
  EMAIL_ON_CRITICAL: true,     // Email for P0 items
  NOTION_ACTIVITY_LOG: true,   // Always log to Activity Stream
};

// ============================================
// ERROR HANDLING & RETRY LOGIC
// ============================================
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  TIMEOUT_MS: 30000,
};

export default {
  NOTION_DATABASES,
  THRESHOLDS,
  AGENTS,
  CLAUDE_CONFIG,
  TIMING,
  NOTIFICATIONS,
  RETRY_CONFIG,
};
