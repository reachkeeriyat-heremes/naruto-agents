/**
 * THRESHOLD EVALUATION
 * Smart escalation logic for the 4 primary triggers
 */

import { THRESHOLDS } from './constants.js';
import { getGoalValue, getActiveBlockers } from './notion-client.js';

// ============================================
// THRESHOLD EVALUATIONS
// ============================================

export async function evaluateEmailQueueThreshold(currentQueueSize) {
  const breached = currentQueueSize > THRESHOLDS.EMAIL_QUEUE_THRESHOLD;

  return {
    agent: 'Itachi',
    threshold: THRESHOLDS.EMAIL_QUEUE_THRESHOLD,
    currentValue: currentQueueSize,
    breached,
    escalationLevel: breached ? 'P1' : 'P3',
    action: breached ? 'Start batch processing emails' : 'Monitor queue',
    reasoning: `Email queue at ${currentQueueSize}/${THRESHOLDS.EMAIL_QUEUE_THRESHOLD} items`,
  };
}

export async function evaluateBlockerThreshold() {
  const activeBlockers = await getActiveBlockers();
  const blockerCount = activeBlockers.length;
  const breached = blockerCount >= THRESHOLDS.BLOCKER_THRESHOLD;

  return {
    agent: 'Kakashi',
    threshold: THRESHOLDS.BLOCKER_THRESHOLD,
    currentValue: blockerCount,
    breached,
    escalationLevel: breached ? 'P0' : 'P3',
    action: breached ? 'ESCALATE IMMEDIATELY - System is blocked' : 'No blockers detected',
    blockerDetails: activeBlockers,
    reasoning: `${blockerCount} active blocker(s) detected. Any blocker = immediate escalation.`,
  };
}

export async function evaluateRevenueDropThreshold() {
  const revenueGoal = await getGoalValue('$90k/month revenue');

  if (!revenueGoal) {
    return {
      agent: 'Naruto',
      threshold: `${THRESHOLDS.REVENUE_DROP_THRESHOLD}%`,
      currentValue: 'Unknown',
      breached: false,
      escalationLevel: 'P3',
      action: 'Unable to fetch revenue data from Goals database',
      reasoning: 'Revenue goal not found in Notion',
    };
  }

  const targetRevenue = revenueGoal.targetValue;
  const currentRevenue = revenueGoal.currentValue;
  const dropPercentage = ((targetRevenue - currentRevenue) / targetRevenue) * 100;
  const breached = dropPercentage > THRESHOLDS.REVENUE_DROP_THRESHOLD;

  return {
    agent: 'Naruto',
    threshold: `${THRESHOLDS.REVENUE_DROP_THRESHOLD}%`,
    targetRevenue,
    currentRevenue,
    dropPercentage: dropPercentage.toFixed(2),
    breached,
    escalationLevel: breached ? 'P1' : 'P3',
    action: breached
      ? `Investigate revenue drop (${dropPercentage.toFixed(2)}% below target)`
      : 'Revenue on track',
    reasoning: `Current: $${currentRevenue} | Target: $${targetRevenue} | Drop: ${dropPercentage.toFixed(2)}%`,
  };
}

export async function evaluateResponseRateThreshold(responseCount, totalOutreach) {
  if (totalOutreach === 0) {
    return {
      agent: 'Zabuza',
      threshold: `${THRESHOLDS.RESPONSE_RATE_THRESHOLD}%`,
      currentValue: 'N/A',
      breached: false,
      escalationLevel: 'P3',
      action: 'Not enough outreach data to evaluate response rate',
      reasoning: 'Need at least 1 outreach attempt to calculate response rate',
    };
  }

  const responseRate = (responseCount / totalOutreach) * 100;
  const breached = responseRate < THRESHOLDS.RESPONSE_RATE_THRESHOLD;

  return {
    agent: 'Zabuza',
    threshold: `${THRESHOLDS.RESPONSE_RATE_THRESHOLD}%`,
    currentValue: responseRate.toFixed(2),
    totalOutreach,
    responseCount,
    breached,
    escalationLevel: breached ? 'P1' : 'P3',
    action: breached
      ? 'PAUSE COLD OUTREACH - Response rate below target. Refine messaging.'
      : 'Continue outreach campaign',
    reasoning: `Response rate: ${responseRate.toFixed(2)}% (${responseCount}/${totalOutreach}). Target: ${THRESHOLDS.RESPONSE_RATE_THRESHOLD}%+`,
  };
}

// ============================================
// AGGREGATE THRESHOLD CHECK
// ============================================

export async function evaluateAllThresholds(contextData = {}) {
  const results = {
    timestamp: new Date().toISOString(),
    thresholds: [],
    escalations: [],
    summary: '',
  };

  // Email Queue Check
  const emailCheck = await evaluateEmailQueueThreshold(
    contextData.emailQueueSize || 0
  );
  results.thresholds.push(emailCheck);
  if (emailCheck.breached) results.escalations.push(emailCheck);

  // Blocker Check
  const blockerCheck = await evaluateBlockerThreshold();
  results.thresholds.push(blockerCheck);
  if (blockerCheck.breached) results.escalations.push(blockerCheck);

  // Revenue Check
  const revenueCheck = await evaluateRevenueDropThreshold();
  results.thresholds.push(revenueCheck);
  if (revenueCheck.breached) results.escalations.push(revenueCheck);

  // Response Rate Check
  const responseCheck = await evaluateResponseRateThreshold(
    contextData.responseCount || 0,
    contextData.totalOutreach || 0
  );
  results.thresholds.push(responseCheck);
  if (responseCheck.breached) results.escalations.push(responseCheck);

  // Summary
  const escalationCount = results.escalations.length;
  if (escalationCount === 0) {
    results.summary = '✅ All thresholds healthy. System operating normally.';
  } else if (escalationCount === 1) {
    const critical = results.escalations.find((e) => e.escalationLevel === 'P0');
    results.summary = critical
      ? `🚨 CRITICAL: ${critical.agent} detected ${critical.action}`
      : `⚠️ WARNING: ${results.escalations[0].agent} threshold breached`;
  } else {
    results.summary = `🚨 ${escalationCount} thresholds breached. Multiple agent escalations needed.`;
  }

  return results;
}

export default {
  evaluateEmailQueueThreshold,
  evaluateBlockerThreshold,
  evaluateRevenueDropThreshold,
  evaluateResponseRateThreshold,
  evaluateAllThresholds,
};
