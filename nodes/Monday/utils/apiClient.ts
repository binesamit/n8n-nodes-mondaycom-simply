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
	 * Add update (comment) to an item
	 */
	async addUpdate(itemId: string, body: string, parentId?: string): Promise<any> {
		const query = `
			mutation CreateUpdate($itemId: ID!, $body: String!, $parentId: ID) {
				create_update(item_id: $itemId, body: $body, parent_id: $parentId) {
					id
					body
					created_at
					replies {
						id
					}
				}
			}
		`;

		const response = await this.executeQuery(query, { itemId, body, parentId });
		return response.data.create_update;
	}

	/**
	 * Get items by column value
	 */
	async getItemsByColumnValue(
		boardId: string,
		columnId: string,
		columnValue: string,
		limit: number = 50,
	): Promise<Item[]> {
		const query = `
			query GetItemsByColumnValue($boardId: ID!, $columnId: String!, $columnValue: String!, $limit: Int) {
				items_page_by_column_values(
					board_id: $boardId,
					columns: [{column_id: $columnId, column_values: [$columnValue]}],
					limit: $limit
				) {
					items {
						id
						name
						column_values {
							id
							type
							text
							value
						}
					}
				}
			}
		`;

		const response = await this.executeQuery(query, {
			boardId,
			columnId,
			columnValue,
			limit,
		});

		return response.data.items_page_by_column_values?.items || [];
	}

	/**
	 * Move item to a different group
	 */
	async moveItemToGroup(itemId: string, groupId: string): Promise<Item> {
		const query = `
			mutation MoveItemToGroup($itemId: ID!, $groupId: String!) {
				move_item_to_group(item_id: $itemId, group_id: $groupId) {
					id
					name
				}
			}
		`;

		const response = await this.executeQuery(query, { itemId, groupId });
		return response.data.move_item_to_group;
	}

	/**
	 * Create a new board
	 */
	async createBoard(
		boardName: string,
		boardKind: string,
		workspaceId?: string,
		folderId?: string,
		templateId?: string,
	): Promise<any> {
		const query = `
			mutation CreateBoard($boardName: String!, $boardKind: BoardKind!, $workspaceId: ID, $folderId: ID, $templateId: ID) {
				create_board(
					board_name: $boardName,
					board_kind: $boardKind,
					workspace_id: $workspaceId,
					folder_id: $folderId,
					template_id: $templateId
				) {
					id
					name
					board_kind
					state
				}
			}
		`;

		const response = await this.executeQuery(query, {
			boardName,
			boardKind,
			workspaceId,
			folderId,
			templateId,
		});

		return response.data.create_board;
	}

	/**
	 * Create a new group in a board
	 */
	async createGroup(boardId: string, groupName: string): Promise<any> {
		const query = `
			mutation CreateGroup($boardId: ID!, $groupName: String!) {
				create_group(board_id: $boardId, group_name: $groupName) {
					id
					title
					color
				}
			}
		`;

		const response = await this.executeQuery(query, { boardId, groupName });
		return response.data.create_group;
	}

	/**
	 * Get all workspaces
	 */
	async getWorkspaces(): Promise<any[]> {
		const cacheKey = 'workspaces_list';
		const cached = CacheManager.get<any[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetWorkspaces {
				workspaces {
					id
					name
					kind
					description
				}
			}
		`;

		const response = await this.executeQuery(query);
		const workspaces = response.data.workspaces;

		CacheManager.set(cacheKey, workspaces, 10 * 60 * 1000); // 10 minutes TTL
		return workspaces;
	}

	/**
	 * Get templates from account
	 */
	async getTemplates(): Promise<any[]> {
		const cacheKey = 'templates_list';
		const cached = CacheManager.get<any[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetTemplates {
				boards(limit: 200, state: template) {
					id
					name
					description
				}
			}
		`;

		const response = await this.executeQuery(query);
		const templates = response.data.boards || [];

		CacheManager.set(cacheKey, templates, 10 * 60 * 1000); // 10 minutes TTL
		return templates;
	}

	/**
	 * Get groups from a specific board
	 */
	async getGroups(boardId: string): Promise<any[]> {
		const cacheKey = `groups:${boardId}`;
		const cached = CacheManager.get<any[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const query = `
			query GetGroups($boardId: [ID!]) {
				boards(ids: $boardId) {
					groups {
						id
						title
						color
						position
					}
				}
			}
		`;

		const response = await this.executeQuery(query, { boardId: [boardId] });
		const groups = response.data.boards[0]?.groups || [];

		CacheManager.set(cacheKey, groups, 5 * 60 * 1000); // 5 minutes TTL
		return groups;
	}

	/**
	 * Create a folder in workspace
	 */
	async createFolder(
		workspaceId: string,
		folderName: string,
		color?: string,
		parentFolderId?: string,
	): Promise<any> {
		const query = `
			mutation CreateFolder($workspaceId: ID!, $folderName: String!, $color: FolderColor, $parentFolderId: ID) {
				create_folder(workspace_id: $workspaceId, name: $folderName, color: $color, parent_folder_id: $parentFolderId) {
					id
					name
					color
					workspace {
						id
						name
					}
					parent {
						id
						name
					}
				}
			}
		`;

		const response = await this.executeQuery(query, {
			workspaceId,
			folderName,
			color: color === 'null' ? null : color,
			parentFolderId,
		});
		return response.data.create_folder;
	}

	/**
	 * Update a folder
	 */
	async updateFolder(folderId: string, folderName?: string, color?: string): Promise<any> {
		const query = `
			mutation UpdateFolder($folderId: ID!, $folderName: String, $color: FolderColor) {
				update_folder(folder_id: $folderId, name: $folderName, color: $color) {
					id
					name
					color
				}
			}
		`;

		const response = await this.executeQuery(query, {
			folderId,
			folderName,
			color: color === 'null' ? null : color,
		});
		return response.data.update_folder;
	}

	/**
	 * Delete a folder
	 */
	async deleteFolder(folderId: string): Promise<boolean> {
		const query = `
			mutation DeleteFolder($folderId: ID!) {
				delete_folder(folder_id: $folderId) {
					id
				}
			}
		`;

		const response = await this.executeQuery(query, { folderId });
		return !!response.data.delete_folder;
	}

	/**
	 * Create a doc
	 */
	async createDoc(
		workspaceId: string,
		docName: string,
		docKind: string = 'private',
		folderId?: string,
	): Promise<any> {
		// Build location object according to Monday.com API structure
		const locationInput: any = {
			workspace: {
				workspace_id: parseInt(workspaceId),
				name: docName,
				kind: docKind,
			},
		};

		// If folder is provided, add folder_id to workspace object
		if (folderId) {
			locationInput.workspace.folder_id = parseInt(folderId);
		}

		const query = `
			mutation CreateDoc($location: CreateDocInput!) {
				create_doc(location: $location) {
					id
					name
					url
					object_id
					workspace_id
				}
			}
		`;

		const response = await this.executeQuery(query, {
			location: locationInput,
		});
		return response.data.create_doc;
	}

	/**
	 * Add blocks to a doc using create_doc_block for RTL support
	 */
	async addBlocksToDoc(docId: string, blocks: any[], textDirection: string = 'ltr'): Promise<any> {
		const isRTL = textDirection === 'rtl';
		const blockIds: string[] = [];

		// If RTL, use create_doc_block with direction parameter
		if (isRTL) {
			for (const block of blocks) {
				const content = block.content || '';
				const blockType = this.mapBlockType(block.type);
				const alignment = isRTL ? 'right' : 'left';

				// Build deltaFormat content
				const contentJson = JSON.stringify({
					alignment,
					direction: 'rtl',
					deltaFormat: [{ insert: content }],
				});

				const query = `
					mutation CreateDocBlock($docId: ID!, $type: DocBlockContentType!, $content: JSON!) {
						create_doc_block(doc_id: $docId, type: $type, content: $content) {
							id
						}
					}
				`;

				const response = await this.executeQuery(query, {
					docId: docId,
					type: blockType,
					content: contentJson,
				});

				blockIds.push(response.data.create_doc_block.id);
			}

			return { success: true, block_ids: blockIds };
		}

		// For LTR, use markdown (faster)
		const markdown = this.convertBlocksToMarkdown(blocks, textDirection);

		const query = `
			mutation AddContentToDoc($docId: ID!, $markdown: String!) {
				add_content_to_doc_from_markdown(docId: $docId, markdown: $markdown) {
					success
					block_ids
					error
				}
			}
		`;

		const response = await this.executeQuery(query, {
			docId: parseInt(docId),
			markdown,
		});

		if (!response.data.add_content_to_doc_from_markdown.success) {
			throw new Error(response.data.add_content_to_doc_from_markdown.error || 'Failed to add blocks to doc');
		}

		return response.data.add_content_to_doc_from_markdown;
	}

	/**
	 * Map block type to Monday.com DocBlockContentType
	 */
	private mapBlockType(type: string): string {
		const typeMap: { [key: string]: string } = {
			large_title: 'large_title',
			medium_title: 'medium_title',
			small_title: 'small_title',
			normal_text: 'normal_text',
			quote: 'quote',
			bulleted_list: 'bulleted_list',
			numbered_list: 'numbered_list',
			check_list: 'check_list',
			code: 'code',
			divider: 'divider',
		};

		return typeMap[type] || 'normal_text';
	}

	/**
	 * Convert blocks array to markdown string (LTR only)
	 */
	private convertBlocksToMarkdown(blocks: any[], textDirection: string = 'ltr'): string {
		const lines: string[] = [];

		for (const block of blocks) {
			const content = block.content || '';

			switch (block.type) {
				case 'large_title':
					lines.push(`# ${content}`);
					break;
				case 'medium_title':
					lines.push(`## ${content}`);
					break;
				case 'small_title':
					lines.push(`### ${content}`);
					break;
				case 'quote':
					lines.push(`> ${content}`);
					break;
				case 'bulleted_list':
					// Split by newlines and add bullet points
					content.split('\n').forEach((line: string) => {
						if (line.trim()) lines.push(`- ${line.trim()}`);
					});
					break;
				case 'numbered_list':
					// Split by newlines and add numbers
					content.split('\n').forEach((line: string, idx: number) => {
						if (line.trim()) lines.push(`${idx + 1}. ${line.trim()}`);
					});
					break;
				case 'check_list':
					// Split by newlines and add checkboxes
					content.split('\n').forEach((line: string) => {
						if (line.trim()) lines.push(`- [ ] ${line.trim()}`);
					});
					break;
				case 'code':
					lines.push('```');
					lines.push(content);
					lines.push('```');
					break;
				case 'divider':
					lines.push('---');
					break;
				case 'normal_text':
				default:
					if (content) lines.push(content);
					break;
			}

			// Add empty line between blocks
			lines.push('');
		}

		return lines.join('\n');
	}

	/**
	 * Get a doc with blocks
	 */
	async getDoc(docId: string): Promise<any> {
		const query = `
			query GetDoc($docId: ID!) {
				docs(ids: [$docId]) {
					id
					name
					url
					created_at
					object_id
					workspace {
						id
						name
					}
					created_by {
						id
						name
					}
					blocks {
						id
						type
						content
						created_at
						created_by {
							id
							name
						}
						position
						updated_at
					}
				}
			}
		`;

		const response = await this.executeQuery(query, { docId });
		return response.data.docs[0];
	}

	/**
	 * Delete a doc
	 */
	async deleteDoc(docId: string): Promise<boolean> {
		const query = `
			mutation DeleteDoc($docId: Int!) {
				delete_doc(docId: $docId)
			}
		`;

		const response = await this.executeQuery(query, { docId: parseInt(docId) });
		return !!response.data.delete_doc;
	}

	/**
	 * Query users with filters and custom fields
	 */
	async queryUsers(filters?: {
		emails?: string[];
		ids?: string[];
		kind?: string;
		limit?: number;
		name?: string;
		newestFirst?: boolean;
	}, returnFields?: {
		includeEmail?: boolean;
		includeAccount?: boolean;
		includeIsAdmin?: boolean;
		includeIsGuest?: boolean;
		includePhoto?: boolean;
		includeTeams?: boolean;
		includeCreatedAt?: boolean;
	}): Promise<any[]> {
		// Build query fields dynamically
		const fields = ['id', 'name'];

		if (returnFields?.includeEmail) fields.push('email');
		if (returnFields?.includeAccount) fields.push('account { id name }');
		if (returnFields?.includeIsAdmin) fields.push('is_admin');
		if (returnFields?.includeIsGuest) fields.push('is_guest');
		if (returnFields?.includePhoto) fields.push('photo_small');
		if (returnFields?.includeTeams) fields.push('teams { id name }');
		if (returnFields?.includeCreatedAt) fields.push('created_at');

		// Build query arguments
		const args: string[] = [];
		const variables: any = {};

		if (filters?.emails && filters.emails.length > 0) {
			args.push('emails: $emails');
			variables.emails = filters.emails;
		}
		if (filters?.ids && filters.ids.length > 0) {
			args.push('ids: $ids');
			variables.ids = filters.ids;
		}
		if (filters?.kind && filters.kind !== 'all') {
			args.push('kind: $kind');
			variables.kind = filters.kind;
		}
		if (filters?.limit) {
			args.push('limit: $limit');
			variables.limit = filters.limit;
		}
		if (filters?.name) {
			args.push('name: $name');
			variables.name = filters.name;
		}
		if (filters?.newestFirst) {
			args.push('newest_first: $newestFirst');
			variables.newestFirst = filters.newestFirst;
		}

		const argsString = args.length > 0 ? `(${args.join(', ')})` : '';

		// Build variable definitions
		const varDefs: string[] = [];
		if (filters?.emails) varDefs.push('$emails: [String!]');
		if (filters?.ids) varDefs.push('$ids: [ID!]');
		if (filters?.kind && filters.kind !== 'all') varDefs.push('$kind: UserKind');
		if (filters?.limit) varDefs.push('$limit: Int');
		if (filters?.name) varDefs.push('$name: String');
		if (filters?.newestFirst) varDefs.push('$newestFirst: Boolean');

		const varDefsString = varDefs.length > 0 ? `(${varDefs.join(', ')})` : '';

		const query = `
			query GetUsers${varDefsString} {
				users${argsString} {
					${fields.join('\n\t\t\t\t\t')}
				}
			}
		`;

		const response = await this.executeQuery(query, variables);
		return response.data.users;
	}

	/**
	 * Get a single user by ID
	 */
	async getUser(userId: string, returnFields?: {
		includeEmail?: boolean;
		includeAccount?: boolean;
		includeIsAdmin?: boolean;
		includeIsGuest?: boolean;
		includePhoto?: boolean;
		includeTeams?: boolean;
		includeCreatedAt?: boolean;
	}): Promise<any> {
		// Build query fields dynamically
		const fields = ['id', 'name'];

		if (returnFields?.includeEmail) fields.push('email');
		if (returnFields?.includeAccount) fields.push('account { id name }');
		if (returnFields?.includeIsAdmin) fields.push('is_admin');
		if (returnFields?.includeIsGuest) fields.push('is_guest');
		if (returnFields?.includePhoto) fields.push('photo_small');
		if (returnFields?.includeTeams) fields.push('teams { id name }');
		if (returnFields?.includeCreatedAt) fields.push('created_at');

		const query = `
			query GetUser($userId: ID!) {
				users(ids: [$userId]) {
					${fields.join('\n\t\t\t\t\t')}
				}
			}
		`;

		const response = await this.executeQuery(query, { userId });
		return response.data.users[0] || null;
	}

	/**
	 * Create an update for an item
	 */
	async createUpdate(
		itemId: string,
		updateText: string,
		mentions?: Array<{ id: number; type: string }>,
		parentUpdateId?: string,
	): Promise<any> {
		// Build mentions list inline since UpdateMentionInput doesn't exist
		let mentionsList = '';
		if (mentions && mentions.length > 0) {
			const mentionsStr = mentions
				.map((m) => `{id: ${m.id}, type: User}`)
				.join(', ');
			mentionsList = `, mentions_list: [${mentionsStr}]`;
		}

		// Add parent_id if provided
		let parentIdParam = '';
		if (parentUpdateId) {
			parentIdParam = `, parent_id: ${parentUpdateId}`;
		}

		const query = `
			mutation CreateUpdate($itemId: ID!, $body: String!) {
				create_update(item_id: $itemId, body: $body${mentionsList}${parentIdParam}) {
					id
					body
					created_at
					creator {
						id
						name
					}
				}
			}
		`;

		const response = await this.executeQuery(query, {
			itemId,
			body: updateText,
		});
		return response.data.create_update;
	}

	/**
	 * Create a reply to an update (uses create_update with parent_id)
	 */
	async createUpdateReply(
		parentUpdateId: string,
		replyText: string,
		mentions?: Array<{ id: number; type: string }>,
	): Promise<any> {
		// Build mentions list inline
		let mentionsList = '';
		if (mentions && mentions.length > 0) {
			const mentionsStr = mentions
				.map((m) => `{id: ${m.id}, type: User}`)
				.join(', ');
			mentionsList = `, mentions_list: [${mentionsStr}]`;
		}

		const query = `
			mutation CreateReply($parentId: ID!, $body: String!) {
				create_update(parent_id: $parentId, body: $body${mentionsList}) {
					id
					body
					created_at
					creator {
						id
						name
					}
				}
			}
		`;

		const response = await this.executeQuery(query, {
			parentId: parentUpdateId,
			body: replyText,
		});
		return response.data.create_update;
	}

	/**
	 * Get updates for an item
	 */
	async getUpdates(itemId: string, limit: number = 25): Promise<any[]> {
		const query = `
			query GetUpdates($itemId: [ID!]!, $limit: Int) {
				items(ids: $itemId) {
					updates(limit: $limit) {
						id
						body
						text_body
						created_at
						creator {
							id
							name
							email
						}
						replies {
							id
							body
							text_body
							created_at
							creator {
								id
								name
							}
						}
					}
				}
			}
		`;

		const response = await this.executeQuery(query, {
			itemId: [itemId],
			limit,
		});

		return response.data.items[0]?.updates || [];
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
