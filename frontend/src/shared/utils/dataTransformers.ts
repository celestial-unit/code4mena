/**
 * Data Transformers
 * Utilities to transform JSON data to proper TypeScript types
 */

import {
  LegalUpdate,
  User,
  ChatConversation,
  SearchResult,
  TunisianMascot,
} from '../types';

/**
 * Transform JSON legal update to proper LegalUpdate type
 */
export function transformLegalUpdate(jsonUpdate: any): LegalUpdate {
  return {
    ...jsonUpdate,
    publishedAt: new Date(jsonUpdate.publishedAt),
    effectiveDate: jsonUpdate.effectiveDate
      ? new Date(jsonUpdate.effectiveDate)
      : undefined,
    source: {
      ...jsonUpdate.source,
      lastUpdated: new Date(jsonUpdate.source.lastUpdated),
    },
  };
}

/**
 * Transform JSON user to proper User type
 */
export function transformUser(jsonUser: any): User {
  return {
    ...jsonUser,
    createdAt: new Date(jsonUser.createdAt),
    lastActiveAt: new Date(jsonUser.lastActiveAt),
    achievements: jsonUser.achievements.map((achievement: any) => ({
      ...achievement,
      unlockedAt: achievement.unlockedAt
        ? new Date(achievement.unlockedAt)
        : undefined,
    })),
    statistics: {
      ...jsonUser.statistics,
      lastWeekActivity: jsonUser.statistics.lastWeekActivity.map(
        (activity: any) => ({
          ...activity,
          date: new Date(activity.date),
        })
      ),
    },
  };
}

/**
 * Transform JSON chat conversation to proper ChatConversation type
 */
export function transformChatConversation(
  jsonConversation: any
): ChatConversation {
  return {
    ...jsonConversation,
    createdAt: new Date(jsonConversation.createdAt),
    updatedAt: new Date(jsonConversation.updatedAt),
    messages: jsonConversation.messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
      editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
    })),
  };
}

/**
 * Transform JSON search result to proper SearchResult type
 */
export function transformSearchResult(jsonResult: any): SearchResult {
  return {
    ...jsonResult,
    publishedAt: new Date(jsonResult.publishedAt),
    lastUpdated: new Date(jsonResult.lastUpdated),
  };
}

/**
 * Transform arrays of JSON data
 */
export function transformLegalUpdates(jsonUpdates: any[]): LegalUpdate[] {
  return jsonUpdates.map(transformLegalUpdate);
}

export function transformUsers(jsonUsers: any[]): User[] {
  return jsonUsers.map(transformUser);
}

export function transformChatConversations(
  jsonConversations: any[]
): ChatConversation[] {
  return jsonConversations.map(transformChatConversation);
}

export function transformSearchResults(jsonResults: any[]): SearchResult[] {
  return jsonResults.map(transformSearchResult);
}
