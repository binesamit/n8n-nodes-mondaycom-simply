import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { MondayApiClient } from '../utils/apiClient';
import { CacheManager } from '../utils/cache';

/**
 * Load status columns from board
 */
export async function loadStatusColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const statusColumns = board.columns.filter((col) => col.type === 'status');

	return statusColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load status values for selected status column
 */
export async function loadStatusValuesForColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	const columnId = this.getCurrentNodeParameter('statusColumn') as string;

	if (!boardId || !columnId) return [];

	const cacheKey = CacheManager.statusValuesKey(boardId, columnId);
	const cached = CacheManager.get<INodePropertyOptions[]>(cacheKey);
	if (cached) return cached;

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'status') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	const options = Object.entries(settings.labels || {}).map(([index, label]) => ({
		name: label as string,
		value: label as string, // Return label text, not index
	}));

	CacheManager.set(cacheKey, options);
	return options;
}

/**
 * Load dropdown columns from board
 */
export async function loadDropdownColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const dropdownColumns = board.columns.filter((col) => col.type === 'dropdown');

	return dropdownColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load dropdown values for selected dropdown column
 */
export async function loadDropdownValues(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	const columnId = this.getCurrentNodeParameter('dropdownColumn') as string;

	if (!boardId || !columnId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'dropdown') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	const labels = settings.labels || {};

	// Monday dropdown settings structure: {1: "בדיקה 1", 2: "בדיקה 2"}
	// We need to return the label text as the value, not the ID
	if (typeof labels === 'object' && !Array.isArray(labels)) {
		return Object.entries(labels).map(([id, name]) => ({
			name: name as string,
			value: name as string, // Monday expects the label text, not the ID
		}));
	}

	// Fallback for array format
	return labels.map((label: any) => ({
		name: typeof label === 'string' ? label : label.name,
		value: typeof label === 'string' ? label : label.name,
	}));
}

/**
 * Load people columns from board
 */
export async function loadPeopleColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const peopleColumns = board.columns.filter((col) => col.type === 'people');

	return peopleColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load users and guests (separated)
 */
export async function loadUsersAndGuests(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const users = await client.getUsers();
	const options: INodePropertyOptions[] = [];

	// Separate regular users and guests
	const regularUsers = users.filter((u: any) => !u.is_guest);
	const guests = users.filter((u: any) => u.is_guest);

	// Add regular users first
	regularUsers.forEach((user: any) => {
		options.push({
			name: `👤 ${user.name} (${user.email})`,
			value: user.id.toString(),
		});
	});

	// Add guests below
	if (guests.length > 0) {
		guests.forEach((user: any) => {
			options.push({
				name: `👥 ${user.name} - Guest (${user.email})`,
				value: user.id.toString(),
			});
		});
	}

	return options;
}

/**
 * Load board relation columns from board
 */
export async function loadBoardRelationColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const boardRelationColumns = board.columns.filter((col) => col.type === 'board_relation');

	return boardRelationColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load items from linked board for board relation
 */
export async function loadLinkedBoardItemsExtended(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	const columnId = this.getCurrentNodeParameter('boardRelationColumn') as string;

	if (!boardId || !columnId) {
		return [];
	}

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	// Get board and find the column
	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'board_relation') {
		return [];
	}

	// Parse linked board IDs from settings
	const settings = JSON.parse(column.settings_str);

	// Monday.com uses 'boardIds' (camelCase) not 'board_ids'
	const linkedBoardIds = settings.boardIds || settings.board_ids || [];

	if (linkedBoardIds.length === 0) {
		return [];
	}

	// Fetch items from linked boards
	const items = await client.getItemsFromBoards(linkedBoardIds);

	return items.map((item) => ({
		name: `${item.name} (#${item.id})`,
		value: item.id,
	}));
}

/**
 * Load timeline columns from board
 */
export async function loadTimelineColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const timelineColumns = board.columns.filter((col) => col.type === 'timeline');

	return timelineColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load status values for currently selected column in fixedCollection
 */
export async function loadStatusValuesForSelectedColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;

	// In fixedCollection context, n8n provides the value being edited directly
	// Try multiple approaches to get the column ID
	let columnId: string | undefined;

	// Method 1: Direct parameter access (when editing the field)
	try {
		columnId = this.getNodeParameter('column') as string;
	} catch (error) {
		// Method 2: Try with context path
		try {
			const params = this.getNodeParameter('columnValues') as any;
			if (params?.statusColumn && Array.isArray(params.statusColumn)) {
				// Get the last item being edited
				const lastItem = params.statusColumn[params.statusColumn.length - 1];
				columnId = lastItem?.column;
			}
		} catch (e) {
			// Method 3: Try getCurrentNodeParameter
			try {
				columnId = this.getCurrentNodeParameter('column') as string;
			} catch (err) {
				// Unable to get column
			}
		}
	}

	if (!boardId || !columnId) return [];

	const cacheKey = CacheManager.statusValuesKey(boardId, columnId);
	const cached = CacheManager.get<INodePropertyOptions[]>(cacheKey);
	if (cached) return cached;

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'status') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	const options = Object.entries(settings.labels || {}).map(([index, label]) => ({
		name: label as string,
		value: label as string, // Return label text, not index
	}));

	CacheManager.set(cacheKey, options);
	return options;
}

/**
 * Load dropdown values for currently selected column in fixedCollection
 */
export async function loadDropdownValuesForSelectedColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;

	// Try multiple approaches to get the column ID
	let columnId: string | undefined;

	// Method 1: Direct parameter access (when editing the field)
	try {
		columnId = this.getNodeParameter('column') as string;
	} catch (error) {
		// Method 2: Try with context path
		try {
			const params = this.getNodeParameter('columnValues') as any;
			if (params?.dropdownColumn && Array.isArray(params.dropdownColumn)) {
				const lastItem = params.dropdownColumn[params.dropdownColumn.length - 1];
				columnId = lastItem?.column;
			}
		} catch (e) {
			// Method 3: Try getCurrentNodeParameter
			try {
				columnId = this.getCurrentNodeParameter('column') as string;
			} catch (err) {
				// Unable to get column
			}
		}
	}

	if (!boardId || !columnId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'dropdown') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	const labels = settings.labels || {};

	// Monday dropdown settings structure: {1: "בדיקה 1", 2: "בדיקה 2"}
	// We need to return the label text as the value, not the ID
	if (typeof labels === 'object' && !Array.isArray(labels)) {
		return Object.entries(labels).map(([id, name]) => ({
			name: name as string,
			value: name as string, // Monday expects the label text, not the ID
		}));
	}

	// Fallback for array format
	return labels.map((label: any) => ({
		name: typeof label === 'string' ? label : label.name,
		value: typeof label === 'string' ? label : label.name,
	}));
}

/**
 * Load linked board items for currently selected column in fixedCollection
 */
export async function loadLinkedBoardItemsForSelectedColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;

	// Try multiple approaches to get the column ID
	let columnId: string | undefined;

	// Method 1: Direct parameter access (when editing the field)
	try {
		columnId = this.getNodeParameter('column') as string;
	} catch (error) {
		// Method 2: Try with context path
		try {
			const params = this.getNodeParameter('columnValues') as any;
			if (params?.boardRelationColumn && Array.isArray(params.boardRelationColumn)) {
				const lastItem = params.boardRelationColumn[params.boardRelationColumn.length - 1];
				columnId = lastItem?.column;
			}
		} catch (e) {
			// Method 3: Try getCurrentNodeParameter
			try {
				columnId = this.getCurrentNodeParameter('column') as string;
			} catch (err) {
				// Unable to get column
			}
		}
	}

	if (!boardId || !columnId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	// Get board and find the column
	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'board_relation') {
		return [];
	}

	// Parse linked board IDs from settings
	const settings = JSON.parse(column.settings_str);
	const linkedBoardIds = settings.board_ids || [];

	if (linkedBoardIds.length === 0) {
		return [];
	}

	// Fetch items from linked boards
	const items = await client.getItemsFromBoards(linkedBoardIds);

	return items.map((item) => ({
		name: `${item.name} (#${item.id})`,
		value: item.id,
	}));
}

/**
 * Load all workspaces
 */
export async function loadWorkspaces(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const workspaces = await client.getWorkspaces();

	return workspaces.map((workspace) => ({
		name: workspace.name,
		value: workspace.id.toString(),
	}));
}

/**
 * Load all templates
 */
export async function loadTemplates(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const templates = await client.getTemplates();

	return templates.map((template) => ({
		name: template.name,
		value: template.id.toString(),
		description: template.description,
	}));
}

/**
 * Load groups from board
 */
export async function loadGroups(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const groups = await client.getGroups(boardId);

	return groups.map((group) => ({
		name: group.title,
		value: group.id,
	}));
}

/**
 * Load all boards for selection
 */
export async function loadBoardsForSelection(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const boards = await client.getBoards(500);

	return boards.map((board) => ({
		name: board.name,
		value: board.id,
	}));
}

/**
 * Load items from selected board
 */
export async function loadItemsFromBoard(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const items = await client.getItemsFromBoards([parseInt(boardId)]);

	return items.map((item) => ({
		name: `${item.name} (#${item.id})`,
		value: item.id,
	}));
}

/**
 * Load text columns (text and long-text only)
 */
export async function loadTextColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const textColumns = board.columns.filter((col) =>
		col.type === 'text' || col.type === 'long-text'
	);

	return textColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load number columns
 */
export async function loadNumberColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const numberColumns = board.columns.filter((col) =>
		col.type === 'numbers' || col.type === 'numeric'
	);

	return numberColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load date columns
 */
export async function loadDateColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const dateColumns = board.columns.filter((col) => col.type === 'date');

	return dateColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load checkbox columns
 */
export async function loadCheckboxColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const checkboxColumns = board.columns.filter((col) => col.type === 'checkbox');

	return checkboxColumns.map((col) => ({
		name: col.title,
		value: col.id,
	}));
}

/**
 * Load all columns (for Free field)
 */
export async function loadAllColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);

	return board.columns.map((col) => ({
		name: `${col.title} (${col.type})`,
		value: col.id,
	}));
}
