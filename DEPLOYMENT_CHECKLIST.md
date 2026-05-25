# Naruto Agents Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Create a `.env` file in the project root (DO NOT commit to git):
NOTION_API_KEY=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
CLAUDE_API_KEY=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
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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

### 2. Verify Notion Databases
- Activity Stream: e6a478b7-9274-410e-9bb3-4f61c34f1037
- Tasks: 19893e20-d7fa-47d1-bd96-69b29e05c586
- Projects: edb5814f-f67e-4159-94a5-408e360f56e3
- Goals & Milestones: 9340cf10-889c-4831-8dcd-6f346b4ba52d
- Knowledge Base: 58c89112-b9bf-4ce0-a8ac-782eb091f669
- Daily Execution Log: 2fd4f462-d509-479f-a695-aa13c9c54bbf

### 3. Test Locally
npm install
npm run test-local

## Deployment to Cloudflare Workers

### Step 1: Create Cloudflare Account
- Go to https://dash.cloudflare.com/sign-up
- Sign up with email
- Verify email

### Step 2: Get Account ID
- Log in to https://dash.cloudflare.com
- Go to "Workers & Pages" on left
- Find "Account ID" on right side
- Copy it and update wrangler.toml

### Step 3: Deploy Secrets
wrangler secret put NOTION_API_KEY --env production
wrangler secret put CLAUDE_API_KEY --env production
wrangler secret put SLACK_WEBHOOK_URL --env production

### Step 4: Deploy to Cloudflare
npm run deploy

### Step 5: Test Deployment
curl https://naruto-agents.yourname.workers.dev/
Should return: {"status":"ok","message":"Naruto Agents Worker is running..."}

## After Deployment

### Monitor Execution
npx wrangler tail --env production

### Check Notion Activity Stream
- 08:00 - Kakashi morning agenda
- 09:00 - Jiraiya mindset check
- 12:00 - Might Guy content brief
- 12:00 - Zabuza reply rate analysis
- 00, 06, 12, 18:00 - Naruto revenue intelligence
- 17:00 - End-of-day summary

### If Something Breaks
1. Check logs: npx wrangler tail --env production
2. Verify API keys are set: npx wrangler secret list --env production
3. Check Notion databases are accessible
4. Verify Claude API key has credits

## Done
System is now running. Check Activity Stream every 30 minutes for logs.
