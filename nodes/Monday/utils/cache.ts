import { CacheEntry } from '../types/Monday.types';

/**
 * Cache Manager for Monday.com API data
 * Reduces API calls by caching board metadata, columns, and items
 */
export class CacheManager {
	private static cache = new Map<string, CacheEntry<any>>();
	private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

	/**
	 * Set a value in cache with TTL
	 */
	static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		});
	}

	/**
	 * Get a value from cache (returns null if expired or not found)
	 */
	static get<T>(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) return null;

		const isExpired = Date.now() - entry.timestamp > entry.ttl;

		if (isExpired) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	/**
	 * Invalidate cache entries matching a pattern
	 */
	static invalidate(pattern: string): void {
		const keysToDelete: string[] = [];

		this.cache.forEach((_, key) => {
			if (key.includes(pattern)) {
				keysToDelete.push(key);
			}
		});

		keysToDelete.forEach((key) => this.cache.delete(key));
	}

	/**
	 * Clear all cache
	 */
	static clear(): void {
		this.cache.clear();
	}

	/**
	 * Check if key exists and is valid
	 */
	static has(key: string): boolean {
		return this.get(key) !== null;
	}

	// Cache key generators
	static boardKey(boardId: string): string {
		return `board:${boardId}`;
	}

	static columnsKey(boardId: string): string {
		return `columns:${boardId}`;
	}

	static linkedItemsKey(boardId: string): string {
		return `linked_items:${boardId}`;
	}

	static statusValuesKey(boardId: string, columnId: string): string {
		return `status_values:${boardId}:${columnId}`;
	}

	static formulaColumnsKey(boardId: string): string {
		return `formula_columns:${boardId}`;
	}

	static usersKey(): string {
		return 'users';
	}

	static teamsKey(): string {
		return 'teams';
	}

	static itemsKey(boardId: string): string {
		return `items:${boardId}`;
	}
}
