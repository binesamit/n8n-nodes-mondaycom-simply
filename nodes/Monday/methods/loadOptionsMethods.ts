import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { MondayApiClient } from '../utils/apiClient';
import { CacheManager } from '../utils/cache';

/**
 * Load boards for selection
 */
export async function loadBoards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const boards = await client.getBoards(100);

	return boards.map((board) => ({
		name: board.name,
		value: board.id,
	}));
}

/**
 * Load columns from selected board
 */
export async function loadColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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

	return board.columns.map((column) => ({
		name: `${column.title} (${column.type})`,
		value: column.id,
		description: column.type,
	}));
}

/**
 * Load formula columns only
 */
export async function loadFormulaColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	if (!boardId) return [];

	const credentials = await this.getCredentials('mondayApi');
	const client = new MondayApiClient(
		credentials.apiToken as string,
		'2024-01', // Force newer version for formula support
		true,
	);

	const formulaColumns = await client.getFormulaColumns(boardId);

	return formulaColumns.map((col) => ({
		name: col.title,
		value: col.id,
		description: parseFormulaDescription(col.settings_str),
	}));
}

/**
 * Load users from workspace
 */
export async function loadUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const users = await client.getUsers();
	const teams = await client.getTeams();

	const options: INodePropertyOptions[] = [];

	// Add users
	users.forEach((user: any) => {
		options.push({
			name: `👤 ${user.name} (${user.email})`,
			value: user.id.toString(),
		});
	});

	// Add teams
	teams.forEach((team: any) => {
		options.push({
			name: `👥 ${team.name}`,
			value: `team_${team.id}`,
		});
	});

	return options;
}

/**
 * Load items from linked boards (for board_relation columns)
 */
export async function loadLinkedBoardItems(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	const columnId = this.getCurrentNodeParameter('column') as string;

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
 * Load status values for a status column
 */
export async function loadStatusValues(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getCurrentNodeParameter('board') as string;
	const columnId = this.getCurrentNodeParameter('column') as string;

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
		value: index,
	}));

	CacheManager.set(cacheKey, options);
	return options;
}

/**
 * Load columns from board (for createSimple)
 */
export async function loadBoardColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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

	return board.columns.map((column) => ({
		name: `${column.title} (${column.type})`,
		value: column.id,
		description: column.type,
	}));
}

/**
 * Helper: Parse formula description
 */
function parseFormulaDescription(settingsStr: string): string {
	try {
		const settings = JSON.parse(settingsStr);
		return settings.formula || 'Formula column';
	} catch {
		return 'Formula column';
	}
}
