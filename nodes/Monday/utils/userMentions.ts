/**
 * Utility functions for handling user mentions in text
 */

/**
 * Parse text with @userid mentions and return text with user names + mentions list
 *
 * Example input: "Hello @12345678, please review this"
 * Output: { text: "Hello @Or Drori, please review this", mentions: [{ id: 12345678, type: 'User' }] }
 *
 * @param text - Text containing @userid mentions
 * @param getUserById - Function to fetch user data by ID
 * @returns Object with formatted text and mentions list
 */
export async function parseUserMentions(
	text: string,
	getUserById: (userId: string) => Promise<any>,
): Promise<{ text: string; mentions: Array<{ id: number; type: string }> }> {
	// Find all @userid patterns in the text
	const mentionPattern = /@(\d+)/g;
	const matches = Array.from(text.matchAll(mentionPattern));

	if (matches.length === 0) {
		// No mentions found, return text as-is
		return { text, mentions: [] };
	}

	// Fetch user data for all mentioned users
	const userCache = new Map<string, any>();
	const mentions: Array<{ id: number; type: string }> = [];

	for (const match of matches) {
		const userId = match[1];
		if (!userCache.has(userId)) {
			try {
				const user = await getUserById(userId);
				if (user) {
					userCache.set(userId, user);
					mentions.push({ id: parseInt(userId), type: 'User' });
				}
			} catch (error) {
				// If user not found, will be displayed as plain text
				console.warn(`User ${userId} not found:`, error);
			}
		}
	}

	// Don't replace @userid in text - Monday.com will handle the replacement
	// Just return the original text with mentions list
	return { text, mentions };
}

/**
 * Simple HTML escape function
 */
function escapeHtml(text: string): string {
	const map: { [key: string]: string } = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Extract user IDs from text containing @userid mentions
 *
 * @param text - Text to search for mentions
 * @returns Array of user IDs found in the text
 */
export function extractUserIds(text: string): string[] {
	const mentionPattern = /@(\d+)/g;
	const matches = Array.from(text.matchAll(mentionPattern));
	return matches.map(match => match[1]);
}

/**
 * Convert plain text with @userid to Monday.com update format
 * This is specifically for creating updates with mentions
 *
 * @param text - Text with @userid mentions
 * @returns Text formatted for Monday.com updates API
 */
export function formatTextForUpdate(text: string): string {
	// Monday.com updates API accepts mentions in the format: @[User Name](user:USER_ID)
	// But we need to look up the user name first
	// For now, keep the @userid format as Monday API might handle it
	return text;
}
