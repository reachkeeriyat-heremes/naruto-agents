/**
 * AGENT LOGIC
 * Individual agent implementations (Kakashi, Jiraiya, Itachi, Might Guy, Zabuza, Naruto)
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { AGENTS, CLAUDE_CONFIG } from './constants.js';
import { logActivity, createTask, logDailyExecution } from './notion-client.js';

const client = new Anthropic();

// ============================================
// KAKASHI - ORCHESTRATOR & BLOCKER DETECTION
// ============================================
export async function kakashiMorningAgenda() {
  const systemPrompt = `You are Kakashi, the Orchestrator. Your role is to:
1. Review all pending tasks and blockers
2. Prioritize the day using the Eisenhower Matrix (Urgent/Important)
3. Identify and escalate any system blockers immediately
4. Create a structured morning agenda

Be concise, strategic, and spot P0 blockers immediately.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_CONFIG.MODEL,
      max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content:
            'Create todays morning agenda. Identify any blockers that need immediate escalation.',
        },
      ],
    });

    const agenda = response.content[0].type === 'text' ? response.content[0].text : '';

    await logActivity('Kakashi', 'Morning Agenda Created', { agenda }, 'P2');

    return {
      agent: 'Kakashi',
      action: 'Morning Agenda',
      output: agenda,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Kakashi morning agenda error:', error);
    throw error;
  }
}

export async function kakashiBlocumerDetection(blockers) {
  if (!blockers || blockers.length === 0) {
    return {
      agent: 'Kakashi',
      action: 'Blocker Check',
      status: 'No blockers detected',
      escalationRequired: false,
    };
  }

  try {
    const response = await client.messages.create({
      model: CLAUDE_CONFIG.MODEL,
      max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
      system:
        'You are Kakashi. Analyze these blockers and recommend immediate actions. Be direct.',
      messages: [
        {
          role: 'user',
          content: `${blockers.length} BLOCKER(S) DETECTED:\n${blockers.map((b) => `- ${b.title} (${b.owner})`).join('\n')}\n\nWhat should we do immediately?`,
        },
      ],
    });

    const analysis = response.content[0].type === 'text' ? response.content[0].text : '';

    await logActivity('Kakashi', `${blockers.length} Blocker(s) Escalated`, { blockers, analysis }, 'P0');

    await createTask(
      `BLOCKER: ${blockers[0].title}`,
      analysis,
      'P0',
      'Kakashi'
    );

    return {
      agent: 'Kakashi',
      action: 'Blocker Analysis',
      output: analysis,
      escalationRequired: true,
      escalationLevel: 'P0',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Kakashi blocker detection error:', error);
    throw error;
  }
}

// ============================================
// JIRAIYA - MENTAL HEALTH & ENERGY
// ============================================
export function jiraiyaMindsetCheck() {
  const questions = [
    '1. Energy Level (1-10): How would you rate your energy right now?',
    '2. Stress Level (1-10): What is your current stress level?',
    '3. Focus (1-10): How focused are you on your goals today?',
    '4. Blockers: What is blocking your progress right now?',
    '5. Win: What is one win you achieved today or yesterday?',
    '6. Friction: What business friction did you encounter?',
    '7. Support: What support would help you most right now?',
  ];

  return {
    agent: 'Jiraiya',
    action: 'Daily Mindset Check',
    questions,
    timestamp: new Date().toISOString(),
    instruction: 'Please answer these 7 questions. Your responses will inform team strategy.',
  };
}

// ============================================
// ITACHI - EMAIL PERSONALIZATION
// ============================================
export async function itachiEmailHook(recipientProfile) {
  const systemPrompt = `You are Itachi, the Email Personalization expert. You design cold email hooks that:
1. Grab attention with a specific insight about the prospect
2. Match their communication style and tone
3. Make a compelling angle for why they should care

Be creative, specific, and avoid generic templates.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_CONFIG.MODEL,
      max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Design a personalized email hook for this prospect:\nName: ${recipientProfile.name}\nCompany: ${recipientProfile.company}\nRole: ${recipientProfile.role}\nRecent Activity: ${recipientProfile.recentActivity || 'Unknown'}\n\nCreate a compelling opening line (max 1-2 sentences).`,
        },
      ],
    });

    const hook = response.content[0].type === 'text' ? response.content[0].text : '';

    await logActivity('Itachi', 'Email Hook Generated', { recipientProfile, hook }, 'P3');

    return {
      agent: 'Itachi',
      action: 'Email Hook Generation',
      recipient: recipientProfile.name,
      hook,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Itachi email hook error:', error);
    throw error;
  }
}

// ============================================
// MIGHT GUY - CONTENT STRATEGY
// ============================================
export async function mightGuyContentBrief() {
  const systemPrompt = `You are Might Guy, the Content Strategy master. You design daily content briefs for:
- Twitter (X)
- LinkedIn
- Instagram
- TikTok
- YouTube Shorts/Reels

Create ideas that are authentic, valuable, and aligned with founder voice.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_CONFIG.MODEL,
      max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content:
            'Create todays content brief. Give me 5 content ideas (one per platform) that are authentic and valuable.',
        },
      ],
    });

    const brief = response.content[0].type === 'text' ? response.content[0].text : '';

    await logActivity('Might Guy', 'Daily Content Brief', { brief }, 'P2');

    return {
      agent: 'Might Guy',
      action: 'Content Brief',
      output: brief,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Might Guy content brief error:', error);
    throw error;
  }
}

// ============================================
// ZABUZA - COLD OUTREACH DECISION MAKER
// ============================================
export async function zabuazReplyRateAnalysis(campaignData) {
  const systemPrompt = `You are Zabuza, the Cold Outreach Decision Maker. You analyze reply rates and decide:
1. Should we continue this campaign?
2. Should we pause and refine messaging?
3. What specific changes would improve results?

Be data-driven and tactical.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_CONFIG.MODEL,
      max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this cold outreach campaign:\nCampaign: ${campaignData.campaignName}\nEmails Sent: ${campaignData.emailsSent}\nReplies: ${campaignData.replies}\nReply Rate: ${((campaignData.replies / campaignData.emailsSent) * 100).toFixed(2)}%\n\nShould we continue, pause, or pivot? Explain your decision.`,
        },
      ],
    });

    const analysis = response.content[0].type === 'text' ? response.content[0].text : '';

    await logActivity('Zabuza', 'Reply Rate Analysis', { campaignData, analysis }, 'P2');

    return {
      agent: 'Zabuza',
      action: 'Reply Rate Decision',
      campaign: campaignData.campaignName,
      output: analysis,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Zabuza reply rate analysis error:', error);
    throw error;
  }
}

// ============================================
// NARUTO - REVENUE INTELLIGENCE
// ============================================
export async function narutoRevenueIntelligence(revenueData) {
  const systemPrompt = `You are Naruto, the Revenue Intelligence expert. You analyze revenue metrics every 6 hours and provide:
1. Growth trend analysis
2. Strategic insights
3. Opportunity identification
4. Risk warnings

Be specific, data-driven, and actionable.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_CONFIG.MODEL,
      max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this revenue data:\nTarget: $${revenueData.target}/month\nCurrent: $${revenueData.current}/month\nLast Month: $${revenueData.lastMonth}/month\nRunway: ${revenueData.runway} days\n\nWhat is the strategic insight? Are we on track?`,
        },
      ],
    });

    const insight = response.content[0].type === 'text' ? response.content[0].text : '';

    await logActivity('Naruto', 'Revenue Intelligence Report', { revenueData, insight }, 'P2');

    return {
      agent: 'Naruto',
      action: 'Revenue Analysis',
      output: insight,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Naruto revenue intelligence error:', error);
    throw error;
  }
}

// ============================================
// DAILY AGENT LOG
// ============================================
export async function logAgentExecution(agentName, tasksCompleted, businessImpact) {
  try {
    await logDailyExecution(
      agentName,
      `${agentName} completed daily execution cycle`,
      tasksCompleted,
      businessImpact
    );

    return {
      agent: agentName,
      action: 'Daily Log',
      status: 'logged',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to log execution for ${agentName}:`, error);
    throw error;
  }
}

export default {
  kakashiMorningAgenda,
  kakashiBlocumerDetection,
  jiraiyaMindsetCheck,
  itachiEmailHook,
  mightGuyContentBrief,
  zabuazReplyRateAnalysis,
  narutoRevenueIntelligence,
  logAgentExecution,
};
