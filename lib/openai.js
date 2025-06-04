import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-xsUP3MkZS9wB7EwEuTQk6sY5',
  project: 'proj_ANj2H0wgZGmhLifUl1M7CeAZ',
})
