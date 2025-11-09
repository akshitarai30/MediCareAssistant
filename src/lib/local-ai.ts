'use client';

import data from './health-qa.json';

interface KnowledgeItem {
    id: number;
    keywords: string[];
    answer: string;
}

const knowledgeBase: KnowledgeItem[] = data.knowledgeBase;
const defaultResponse = "I'm sorry, I don't have information on that topic right now. Please consult a medical professional for any health concerns. For emergencies, please use the emergency button.";

/**
 * Finds the best answer from the local knowledge base based on keyword matching.
 * @param query The user's question.
 * @returns The best matching answer or a default response.
 */
export function getLocalAIResponse(query: string): string {
    const queryWords = query.toLowerCase().split(/\s+/);
    let bestMatch = { score: 0, answer: defaultResponse };

    for (const item of knowledgeBase) {
        let currentScore = 0;
        for (const keyword of item.keywords) {
            if (query.toLowerCase().includes(keyword)) {
                // Give more weight to phrases
                currentScore += keyword.includes(' ') ? 2 : 1;
            }
        }

        // Check for individual word matches as a fallback
        for(const word of queryWords) {
            if(item.keywords.includes(word)) {
                currentScore += 0.5;
            }
        }

        if (currentScore > bestMatch.score) {
            bestMatch = { score: currentScore, answer: item.answer };
        }
    }

    return bestMatch.answer;
}
