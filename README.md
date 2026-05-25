# Naruto Agents - 6-Agent Personal Crew

An automated multi-agent system that runs recurring tasks via Claude Code scheduling. Each agent specializes in a different domain of business operations.

## Agents

- **Kakashi** - Orchestrator & Blocker Detection (8am, 4pm, 9pm)
- **Jiraiya** - Mental Health & Energy Check (9am daily)
- **Itachi** - Email Personalization & Hooks (10am daily)
- **Might Guy** - Content Strategy (12pm daily)
- **Zabuza** - Cold Outreach Decision Maker (12pm daily)
- **Naruto** - Revenue Intelligence (every 6 hours)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. Required APIs:
   - Anthropic Claude API key
   - Notion API key
   - Slack webhook URL (optional)

4. Set up recurring task in Claude Code:
   ```
   /schedule naruto-agents-executor every 30 minutes
   ```

## Project Structure

```
src/
├── agents.js           # 6 agent implementations
├── notion-client.js    # Notion API integration
├── constants.js        # Configuration & database IDs
├── thresholds.js       # Escalation logic
└── utils.js           # Utility functions
```

## Notion Integration

- **Activity Stream** - Agent action logs
- **Tasks** - Daily task management
- **Goals & Milestones** - Progress tracking
- **Daily Execution Log** - Agent performance metrics
- **Knowledge Base** - Semantic search

## Mobile Usage

To use on Claude Code iPhone app:
1. Push to GitHub
2. Open project via `File > Clone Repository`
3. Create Remote Trigger endpoint for mobile invocation
4. Call via webhook or dispatch

## Development

View current schedule tasks:
```bash
/schedule list
```

Test a single agent:
```bash
node -e "import('./src/agents.js').then(m => m.jiraiyaMindsetCheck()).then(console.log)"
```

## License

MIT
