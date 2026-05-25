/**
 * NOTION CLIENT
 * Handles all Notion API interactions for the 6-agent system
 */

import { Client } from '@notionhq/client';
import { NOTION_DATABASES } from './constants.js';

let notionClient = null;

export function initNotionClient(apiKey) {
  notionClient = new Client({ auth: apiKey });
  return notionClient;
}

// ============================================
// ACTIVITY STREAM LOGGING
// ============================================
export async function logActivity(agentName, action, details, priority = 'P2') {
  try {
    const response = await notionClient.pages.create({
      parent: { database_id: NOTION_DATABASES.ACTIVITY_STREAM },
      properties: {
        Activity: { title: [{ text: { content: action } }] },
        'Agent Name': { select: { name: agentName } },
        'Priority': { select: { name: priority } },
        'Status': { select: { name: 'Logged' } },
        'Timestamp': { date: { start: new Date().toISOString() } },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: JSON.stringify(details, null, 2) } }],
          },
        },
      ],
    });
    return response;
  } catch (error) {
    console.error(`Failed to log activity for ${agentName}:`, error);
    throw error;
  }
}

// ============================================
// TASK MANAGEMENT
// ============================================
export async function createTask(title, description, priority, assignedAgent) {
  try {
    const response = await notionClient.pages.create({
      parent: { database_id: NOTION_DATABASES.TASKS },
      properties: {
        'Task Name': { title: [{ text: { content: title } }] },
        'Priority': { select: { name: priority } },
        'Status': { select: { name: 'Not Started' } },
        'Owner': { select: { name: assignedAgent } },
        'Created By': { select: { name: assignedAgent } },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: description } }],
          },
        },
      ],
    });
    return response;
  } catch (error) {
    console.error(`Failed to create task "${title}":`, error);
    throw error;
  }
}

export async function updateTaskStatus(taskId, newStatus) {
  try {
    return await notionClient.pages.update({
      page_id: taskId,
      properties: {
        'Status': { select: { name: newStatus } },
      },
    });
  } catch (error) {
    console.error(`Failed to update task ${taskId}:`, error);
    throw error;
  }
}

// ============================================
// GOALS & THRESHOLDS
// ============================================
export async function getGoalValue(goalName) {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_DATABASES.GOALS_MILESTONES,
      filter: {
        property: 'Goal',
        title: {
          contains: goalName,
        },
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const goal = response.results[0].properties;
    return {
      currentValue: goal['Current Value']?.number || 0,
      targetValue: goal['Target Value']?.number || 0,
      unit: goal['Unit']?.select?.name || 'unknown',
      status: goal['Status']?.status?.name || 'Not started',
    };
  } catch (error) {
    console.error(`Failed to fetch goal "${goalName}":`, error);
    return null;
  }
}

export async function updateGoalValue(goalName, currentValue) {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_DATABASES.GOALS_MILESTONES,
      filter: {
        property: 'Goal',
        title: {
          contains: goalName,
        },
      },
    });

    if (response.results.length === 0) {
      console.warn(`Goal "${goalName}" not found`);
      return null;
    }

    const goalPage = response.results[0];
    return await notionClient.pages.update({
      page_id: goalPage.id,
      properties: {
        'Current Value': { number: currentValue },
      },
    });
  } catch (error) {
    console.error(`Failed to update goal "${goalName}":`, error);
    throw error;
  }
}

// ============================================
// DAILY EXECUTION LOG
// ============================================
export async function logDailyExecution(agentName, summary, tasksCompleted, impact) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await notionClient.pages.create({
      parent: { database_id: NOTION_DATABASES.DAILY_EXECUTION_LOG },
      properties: {
        'Entry': { title: [{ text: { content: `${agentName} - ${today}` } }] },
        'Date': { date: { start: today } },
        'Logged By': { multi_select: [{ name: agentName }] },
        'Category': { select: { name: 'System Health' } },
        'Status': { status: { name: 'Completed' } },
        'Priority': { select: { name: 'P2' } },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `**Summary:** ${summary}` } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `**Tasks Completed:** ${tasksCompleted}` } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `**Business Impact:** ${impact}` } }],
          },
        },
      ],
    });
    return response;
  } catch (error) {
    console.error(`Failed to log daily execution for ${agentName}:`, error);
    throw error;
  }
}

// ============================================
// BLOCKERS & ISSUES
// ============================================
export async function getActiveBlockers() {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_DATABASES.TASKS,
      filter: {
        and: [
          {
            property: 'Status',
            status: {
              does_not_equal: 'Complete',
            },
          },
          {
            property: 'Priority',
            select: {
              equals: 'P0',
            },
          },
        ],
      },
    });

    return response.results.map((page) => ({
      id: page.id,
      title: page.properties['Task Name']?.title[0]?.plain_text || 'Unknown',
      owner: page.properties['Owner']?.select?.name || 'Unassigned',
      createdTime: page.created_time,
    }));
  } catch (error) {
    console.error('Failed to fetch active blockers:', error);
    return [];
  }
}

// ============================================
// KNOWLEDGE BASE ACCESS
// ============================================
export async function queryKnowledgeBase(query) {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_DATABASES.KNOWLEDGE_BASE,
      filter: {
        or: [
          {
            property: 'Title',
            title: {
              contains: query,
            },
          },
          {
            property: 'Content',
            rich_text: {
              contains: query,
            },
          },
        ],
      },
    });

    return response.results.map((page) => ({
      id: page.id,
      title: page.properties['Title']?.title[0]?.plain_text || 'Unknown',
      url: page.url,
      lastEdited: page.last_edited_time,
    }));
  } catch (error) {
    console.error(`Failed to query knowledge base for "${query}":`, error);
    return [];
  }
}

export { notionClient };
