import { INodeProperties, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { MondayApiClient } from '../utils/apiClient';

/**
 * Generate dynamic collection options for all board columns
 * This creates individual collection items for each column type
 */
export async function loadBoardColumnsAsCollectionOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getNodeParameter('board') as string;

	if (!boardId) {
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

	const board = await client.getBoard(boardId);
	const options: INodePropertyOptions[] = [];

	// System columns to exclude
	const systemColumns = ['name', 'subitems'];
	// Read-only column types to exclude
	const readOnlyTypes = ['mirror', 'formula', 'auto_number', 'creation_log', 'last_updated'];

	for (const column of board.columns) {
		// Skip system and read-only columns
		if (systemColumns.includes(column.id) || readOnlyTypes.includes(column.type)) {
			continue;
		}

		// Map column type to user-friendly name with icon
		const typeIcon = getColumnTypeIcon(column.type);
		const typeName = getColumnTypeName(column.type);

		options.push({
			name: `${typeIcon} ${column.title} (${typeName})`,
			value: `${column.type}|||${column.id}`,
			description: `Column ID: ${column.id}`,
		});
	}

	return options;
}

/**
 * Get icon for column type
 */
function getColumnTypeIcon(type: string): string {
	const icons: Record<string, string> = {
		status: '🔘',
		dropdown: '📋',
		people: '👤',
		date: '📅',
		timeline: '📆',
		numbers: '🔢',
		text: '📝',
		long_text: '📄',
		email: '✉️',
		phone: '📞',
		link: '🔗',
		checkbox: '☑️',
		rating: '⭐',
		board_relation: '🔗',
		tags: '🏷️',
		file: '📎',
	};
	return icons[type] || '📌';
}

/**
 * Get friendly name for column type
 */
function getColumnTypeName(type: string): string {
	const names: Record<string, string> = {
		status: 'Status',
		dropdown: 'Dropdown',
		people: 'People',
		date: 'Date',
		timeline: 'Timeline',
		numbers: 'Number',
		text: 'Text',
		long_text: 'Long Text',
		email: 'Email',
		phone: 'Phone',
		link: 'Link',
		checkbox: 'Checkbox',
		rating: 'Rating',
		board_relation: 'Board Relation',
		tags: 'Tags',
		file: 'Files',
	};
	return names[type] || type;
}

/**
 * Extract column ID from the combined value (type|||columnId)
 */
function extractColumnId(combinedValue: string): string {
	const parts = combinedValue.split('|||');
	return parts.length > 1 ? parts[1] : combinedValue;
}

/**
 * Load status values for dynamically selected column
 */
export async function loadStatusValuesForDynamicColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getNodeParameter('board') as string;
	const columnIdCombined = this.getCurrentNodeParameter('columnId') as string;
	const columnId = extractColumnId(columnIdCombined);

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

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'status') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	return Object.entries(settings.labels || {}).map(([index, label]) => ({
		name: label as string,
		value: label as string,
	}));
}

/**
 * Load dropdown values for dynamically selected column
 */
export async function loadDropdownValuesForDynamicColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getNodeParameter('board') as string;
	const columnIdCombined = this.getCurrentNodeParameter('columnId') as string;
	const columnId = extractColumnId(columnIdCombined);

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

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'dropdown') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	const labels = settings.labels || [];

	return labels.map((label: any) => ({
		name: typeof label === 'string' ? label : label.name,
		value: typeof label === 'string' ? label : label.id,
	}));
}

/**
 * Load linked board items for dynamically selected column
 */
export async function loadLinkedBoardItemsForDynamicColumn(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const boardId = this.getNodeParameter('board') as string;
	const columnIdCombined = this.getCurrentNodeParameter('columnId') as string;
	const columnId = extractColumnId(columnIdCombined);

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

	const board = await client.getBoard(boardId);
	const column = board.columns.find((col) => col.id === columnId);

	if (!column || column.type !== 'board_relation') {
		return [];
	}

	const settings = JSON.parse(column.settings_str);
	const linkedBoardIds = settings.board_ids || [];

	if (linkedBoardIds.length === 0) {
		return [];
	}

	const items = await client.getItemsFromBoards(linkedBoardIds);

	return items.map((item) => ({
		name: `${item.name} (#${item.id})`,
		value: item.id,
	}));
}
