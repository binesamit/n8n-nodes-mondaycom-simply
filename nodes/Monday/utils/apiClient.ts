import { IHttpRequestMethods, IDataObject } from 'n8n-workflow';
import { ApiVersionManager } from './apiVersionManager';
import { CacheManager } from './cache';
import { BoardMetadata, Item, ColumnDefinition } from '../types/Monday.types';

/**
 * Monday.com API Client with GraphQL support
 */
export class MondayApiClient {
	private baseUrl = 'https://api.monday.com/v2';

	constructor(
		private apiToken: string,
		private apiVersion: string = '2023-10',
		private autoUpgrade: boolean = true,
	) {}

	/**
	 * Execute a GraphQL query
	 */
	async executeQuery(
		query: string,
		variables?: IDataObject,
		operation?: string,
		columnType?: string,
	): Promise<any> {
		// Auto-detection: upgrade version if needed
		const versionCheck = await ApiVersionManager.validateAndUpgrade(
			this.apiVersion,
			operation,
			columnType,
			this.autoUpgrade,
		);

		const effectiveVersion = versionCheck.version;

		// Log warning if upgraded
		if (versionCheck.upgraded && versionCheck.warning) {
			console.warn(`[Monday API] ${versionCheck.warning}`);
		}

		const requestOptions = {
			method: 'POST' as IHttpRequestMethods,
			headers: {
				'Content-Type': 'application/json',
				Authorization: this.apiToken,
				'API-Version': effectiveVersion,
			},
			body: JSON.stringify({ query, variables }),
		};

		try {
			const response = await fetch(this.baseUrl, requestOptions);
			const data: any = await response.json();

			if (data.errors) {
				throw new Error(`Monday API Error: ${JSON.stringify(data.errors)}`);
			}

			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Monday API request failed: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Get board metadata with columns
	 */
	async getBoard(boardId: string): Promise<BoardMetadata> {
		const cacheKey = CacheManager.boardKey(boardId);
		const cached = CacheManager.get<BoardMetadata>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetBoardMetadata($boardId: [ID!]) {
				boards(ids: $boardId) {
					id
					name
					columns {
						id
						title
						type
						settings_str
					}
				}
			}
		`;

		const response = await this.executeQuery(query, { boardId: [boardId] });
		const board = response.data.boards[0];

		if (!board) {
			throw new Error(`Board ${boardId} not found or you don't have access`);
		}

		const metadata: BoardMetadata = {
			id: board.id,
			name: board.name,
			columns: board.columns,
		};

		CacheManager.set(cacheKey, metadata);
		return metadata;
	}

	/**
	 * Get items from board(s)
	 */
	async getItemsFromBoards(boardIds: number[]): Promise<Item[]> {
		const cacheKey = `items_multi:${boardIds.join(',')}`;
		const cached = CacheManager.get<Item[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetItems($boardIds: [ID!]) {
				boards(ids: $boardIds) {
					items_page(limit: 500) {
						items {
							id
							name
						}
					}
				}
			}
		`;

		const response = await this.executeQuery(query, { boardIds });
		const items = response.data.boards.flatMap((board: any) => board.items_page.items);

		CacheManager.set(cacheKey, items, 2 * 60 * 1000); // 2 minutes TTL
		return items;
	}

	/**
	 * Get users in workspace
	 */
	async getUsers(): Promise<any[]> {
		const cacheKey = CacheManager.usersKey();
		const cached = CacheManager.get<any[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetUsers {
				users {
					id
					name
					email
					photo_thumb
				}
			}
		`;

		const response = await this.executeQuery(query);
		const users = response.data.users;

		CacheManager.set(cacheKey, users, 10 * 60 * 1000); // 10 minutes TTL
		return users;
	}

	/**
	 * Get teams in workspace
	 */
	async getTeams(): Promise<any[]> {
		const cacheKey = CacheManager.teamsKey();
		const cached = CacheManager.get<any[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetTeams {
				teams {
					id
					name
				}
			}
		`;

		const response = await this.executeQuery(query);
		const teams = response.data.teams;

		CacheManager.set(cacheKey, teams, 10 * 60 * 1000); // 10 minutes TTL
		return teams;
	}

	/**
	 * Get all boards
	 */
	async getBoards(limit: number = 100): Promise<BoardMetadata[]> {
		const cacheKey = 'boards_list';
		const cached = CacheManager.get<BoardMetadata[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetBoards($limit: Int) {
				boards(limit: $limit) {
					id
					name
					columns {
						id
						title
						type
						settings_str
					}
				}
			}
		`;

		const response = await this.executeQuery(query, { limit });
		const boards = response.data.boards.map((board: any) => ({
			id: board.id,
			name: board.name,
			columns: board.columns,
		}));

		CacheManager.set(cacheKey, boards, 5 * 60 * 1000); // 5 minutes TTL
		return boards;
	}

	/**
	 * Get formula columns from a board
	 */
	async getFormulaColumns(boardId: string): Promise<ColumnDefinition[]> {
		const board = await this.getBoard(boardId);
		return board.columns.filter((col) => col.type === 'formula');
	}

	/**
	 * Get items with column values
	 */
	async getItemsWithColumnValues(
		boardId: string,
		columnIds?: string[],
		itemIds?: string[],
		limit: number = 50,
	): Promise<Item[]> {
		const query = `
			query GetItemsWithValues($boardId: [ID!], $itemIds: [ID!], $columnIds: [String!], $limit: Int) {
				boards(ids: $boardId) {
					items_page(limit: $limit, query_params: {ids: $itemIds}) {
						items {
							id
							name
							column_values(ids: $columnIds) {
								id
								type
								text
								value
							}
						}
					}
				}
			}
		`;

		const response = await this.executeQuery(
			query,
			{
				boardId: [boardId],
				itemIds,
				columnIds,
				limit,
			},
			columnIds?.some((id) => id.includes('formula')) ? 'readFormula' : undefined,
		);

		return response.data.boards[0]?.items_page?.items || [];
	}

	/**
	 * Create item
	 */
	async createItem(boardId: string, itemName: string, columnValues?: IDataObject): Promise<Item> {
		const query = `
			mutation CreateItem($boardId: ID!, $itemName: String!, $columnValues: JSON) {
				create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
					id
					name
				}
			}
		`;

		const response = await this.executeQuery(query, {
			boardId,
			itemName,
			columnValues: columnValues ? JSON.stringify(columnValues) : undefined,
		});

		return response.data.create_item;
	}

	/**
	 * Update item columns
	 */
	async updateItemColumns(
		boardId: string,
		itemId: string,
		columnValues: IDataObject,
	): Promise<Item> {
		const query = `
			mutation UpdateItem($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
				change_multiple_column_values(
					board_id: $boardId,
					item_id: $itemId,
					column_values: $columnValues
				) {
					id
					name
				}
			}
		`;

		const response = await this.executeQuery(query, {
			boardId,
			itemId,
			columnValues: JSON.stringify(columnValues),
		});

		return response.data.change_multiple_column_values;
	}

	/**
	 * Delete item
	 */
	async deleteItem(itemId: string): Promise<boolean> {
		const query = `
			mutation DeleteItem($itemId: ID!) {
				delete_item(item_id: $itemId) {
					id
				}
			}
		`;

		const response = await this.executeQuery(query, { itemId });
		return !!response.data.delete_item;
	}

	/**
	 * Clear cache for a specific board
	 */
	clearBoardCache(boardId: string): void {
		CacheManager.invalidate(boardId);
	}

	/**
	 * Clear all cache
	 */
	clearAllCache(): void {
		CacheManager.clear();
	}
}
