import { Node, Edge } from 'reactflow';

export interface FlowNode extends Node {
  data: {
    label: string;
    type: string;
    params?: Record<string, any>;
    icon?: string;
    results?: any;
    paths?: Array<{
      id: string;
      clauses: Array<{
        id: string;
        inputField: string;
        operator: string;
        value: string;
      }>;
      logicalOperator: 'AND' | 'OR';
    }>;
  };
}

export type FlowEdge = Edge & {
  animated?: boolean;
};

export type NodeCategory = 
  | 'general'
  | 'llms'
  | 'knowledge-base'
  | 'integrations'
  | 'data-loaders'
  | 'multi-modal'
  | 'logic'
  | 'ai-tools';

export type NodeType = 
  // General
  | 'input'
  | 'output'
  | 'document-to-text'
  | 'file-save'
  | 'note'
  | 'pipeline'
  | 'scripts'
  | 'api-loader'
  | 'share'

  // LLMs
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'cohere'
  | 'perplexity'
  | 'xai'
  | 'aws'
  | 'azure'

  // Knowledge Base
  | 'kb-reader'
  | 'kb-loader'
  | 'kb-search'
  | 'kb-sync'

  // Integrations
  | 'mysql'
  | 'mongodb'
  | 'github'
  | 'airtable'
  | 'notion'
  | 'hubspot'
  | 'gmail'
  | 'outlook'
  | 'discord'
  | 'google-drive'
  | 'onedrive'
  | 'google-docs'
  | 'google-sheets'
  | 'slack'
  | 'teams'
  | 'make-webhook'
  | 'zapier-webhook'
  | 'activecampaign'
  | 'calendly'
  | 'dropbox'
  | 'google-calendar'
  | 'jira'
  | 'linear'
  | 'mailchimp'
  | 'postman'
  | 'superbox'
  | 'telegram'
  | 'trello'
  | 'whatsapp-business'
  | 'zoom'

  // Data Loaders
  | 'file-loader'
  | 'csv-loader'
  | 'url-loader'
  | 'wiki-loader'
  | 'youtube-loader'
  | 'arxiv-loader'
  | 'rss-loader'

  // Multi-modal
  | 'audio-processor'
  | 'image-processor'

  // Logic
  | 'condition'
  | 'merge'
  | 'time'
  | 'ttsql'

  // AI Tools
  | 'chat-memory'
  | 'data-collector'
  | 'chat-file-reader'
  | 'outlook-trigger'
  | 'gmail-trigger'
  | 'text-processor'
  | 'json-handler'
  | 'file-transformer'
  | 'ai-task-executor'
  | 'notification-node'
  | 'crm-enricher';

export type DatabaseAction = 
  | 'natural-language-query'
  | 'raw-sql-query'
  | 'natural-language-agent'
  | 'mongodb-find'
  | 'mongodb-find-one'
  | 'mongodb-aggregate'
  | 'nl-query'
  | 'nl-aggregation'
  | 'read-file'
  | 'create-pull-request'
  | 'update-pull-request';

export type ProductivityAction =
  | 'read-table'
  | 'add-new-record'
  | 'column-list-writer'
  | 'update-records'
  | 'write-to-database'
  | 'create-new-page'
  | 'create-new-block'
  | 'database-reader'
  | 'database-updater'
  | 'fetch-contacts'
  | 'fetch-companies'
  | 'fetch-deals'
  | 'fetch-tickets'
  | 'fetch-notes'
  | 'fetch-calls'
  | 'create-email-draft'
  | 'send-email'
  | 'draft-reply'
  | 'send-reply'
  | 'send-message'
  | 'read-file'
  | 'save-file'
  | 'add-file';