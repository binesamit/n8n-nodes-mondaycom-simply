import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

import { MondayApiClient } from './utils/apiClient';
import { ColumnMapper } from './utils/columnMapper';
import { buildColumnValuesFromSimpleMode } from './utils/simpleModeBuild';
import { itemOperations, itemFields } from './descriptions/ItemDescription';
import { boardOperations, boardFields } from './descriptions/BoardDescription';
import { groupOperations, groupFields } from './descriptions/GroupDescription';
import * as loadOptions from './methods/loadOptionsMethods';
import * as loadOptionsExtended from './methods/loadOptionsMethodsExtended';

export class Monday implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Monday.com',
		name: 'monday',
		icon: 'file:monday.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Monday.com API',
		defaults: {
			name: 'Monday.com',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mondayApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Board',
						value: 'board',
					},
					{
						name: 'Group',
						value: 'group',
					},
					{
						name: 'Item',
						value: 'item',
					},
				],
				default: 'item',
			},
			...boardOperations,
			...boardFields,
			...groupOperations,
			...groupFields,
			...itemOperations,
			...itemFields,
		],
	};

	methods = {
		loadOptions: {
			loadBoards: loadOptions.loadBoards,
			loadColumns: loadOptions.loadColumns,
			loadFormulaColumns: loadOptions.loadFormulaColumns,
			loadUsers: loadOptions.loadUsers,
			loadLinkedBoardItems: loadOptionsExtended.loadLinkedBoardItemsExtended,
			loadStatusValues: loadOptionsExtended.loadStatusValuesForColumn,
			// Column type loaders
			loadStatusColumns: loadOptionsExtended.loadStatusColumns,
			loadDropdownColumns: loadOptionsExtended.loadDropdownColumns,
			loadPeopleColumns: loadOptionsExtended.loadPeopleColumns,
			loadBoardRelationColumns: loadOptionsExtended.loadBoardRelationColumns,
			loadTimelineColumns: loadOptionsExtended.loadTimelineColumns,
			// Value loaders for selected columns in fixedCollection
			loadStatusValuesForSelectedColumn: loadOptionsExtended.loadStatusValuesForSelectedColumn,
			loadDropdownValuesForSelectedColumn: loadOptionsExtended.loadDropdownValuesForSelectedColumn,
			loadLinkedBoardItemsForSelectedColumn: loadOptionsExtended.loadLinkedBoardItemsForSelectedColumn,
			loadDropdownValues: loadOptionsExtended.loadDropdownValues,
			loadUsersAndGuests: loadOptionsExtended.loadUsersAndGuests,
			// New loaders for v2.1.1
			loadWorkspaces: loadOptionsExtended.loadWorkspaces,
			loadTemplates: loadOptionsExtended.loadTemplates,
			loadGroups: loadOptionsExtended.loadGroups,
			loadBoardsForSelection: loadOptionsExtended.loadBoardsForSelection,
			loadItemsFromBoard: loadOptionsExtended.loadItemsFromBoard,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials
		const credentials = await this.getCredentials('mondayApi');
		const apiVersion = (credentials.apiVersion as string) || '2023-10';
		const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

		const client = new MondayApiClient(
			credentials.apiToken as string,
			apiVersion,
			autoUpgrade,
		);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'item') {
					if (operation === 'create') {
						const boardId = this.getNodeParameter('board', i) as string;
						const itemName = this.getNodeParameter('itemName', i) as string;
						const columnInputMode = this.getNodeParameter('columnInputMode', i) as string;

						let columnValues = {};

						if (columnInputMode === 'advanced') {
							const jsonInput = this.getNodeParameter('columnValuesJson', i) as string;
							columnValues = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
						} else {
							// Simple mode - build column values from dynamic UI fields
							columnValues = buildColumnValuesFromSimpleMode(this, i);
						}

						const item = await client.createItem(boardId, itemName, columnValues);
						returnData.push({ json: item });
					} else if (operation === 'update') {
						const boardId = this.getNodeParameter('board', i) as string;
						const itemId = this.getNodeParameter('itemId', i) as string;
						const columnInputMode = this.getNodeParameter('columnInputMode', i) as string;

						let columnValues = {};

						if (columnInputMode === 'advanced') {
							const jsonInput = this.getNodeParameter('columnValuesJson', i) as string;
							columnValues = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
						} else {
							// Simple mode - build column values from dynamic UI fields
							columnValues = buildColumnValuesFromSimpleMode(this, i);
						}

						const item = await client.updateItemColumns(boardId, itemId, columnValues);
						returnData.push({ json: item });
					} else if (operation === 'get') {
						const boardId = this.getNodeParameter('board', i) as string;
						const itemId = this.getNodeParameter('itemId', i) as string;

						const items = await client.getItemsWithColumnValues(boardId, undefined, [itemId], 1);
						if (items.length > 0) {
							returnData.push({ json: items[0] });
						}
					} else if (operation === 'getAll') {
						const boardId = this.getNodeParameter('board', i) as string;
						const limit = this.getNodeParameter('limit', i, 50) as number;

						const items = await client.getItemsWithColumnValues(boardId, undefined, undefined, limit);
						items.forEach((item) => returnData.push({ json: item }));
					} else if (operation === 'delete') {
						const itemId = this.getNodeParameter('itemId', i) as string;
						const success = await client.deleteItem(itemId);
						returnData.push({ json: { success, itemId } });
					} else if (operation === 'readFormula') {
						const boardId = this.getNodeParameter('board', i) as string;
						const formulaColumns = this.getNodeParameter('formulaColumns', i, []) as string[];
						const outputFormat = this.getNodeParameter('outputFormat', i, 'value') as string;
						const itemIdsStr = this.getNodeParameter('itemIds', i, '') as string;

						const itemIds = itemIdsStr
							? itemIdsStr.split(',').map((id) => id.trim())
							: undefined;

						const items = await client.getItemsWithColumnValues(
							boardId,
							formulaColumns.length > 0 ? formulaColumns : undefined,
							itemIds,
							50,
						);

						// Format output
						items.forEach((item) => {
							const formatted: any = {
								item_id: item.id,
								item_name: item.name,
							};

							if (item.column_values) {
								item.column_values.forEach((col) => {
									const key = col.title?.replace(/\s+/g, '_').toLowerCase() || col.id;

									if (outputFormat === 'value') {
										formatted[key] = parseFormulaValue(col.value || '', col.type || '');
									} else if (outputFormat === 'text') {
										formatted[key] = col.text;
									} else {
										formatted[key] = {
											value: parseFormulaValue(col.value || '', col.type || ''),
											text: col.text,
										};
									}
								});
							}

							returnData.push({ json: formatted });
						});
					} else if (operation === 'addUpdate') {
						const itemId = this.getNodeParameter('itemId', i) as string;
						const updateBody = this.getNodeParameter('updateBody', i) as string;
						const replyToId = this.getNodeParameter('replyToId', i, '') as string;

						const update = await client.addUpdate(itemId, updateBody, replyToId || undefined);
						returnData.push({ json: update });
					} else if (operation === 'getByColumnValue') {
						const boardId = this.getNodeParameter('board', i) as string;
						const columnId = this.getNodeParameter('columnId', i) as string;
						let columnValue = this.getNodeParameter('columnValue', i) as string;
						const limit = this.getNodeParameter('limit', i, 50) as number;

						// For status/dropdown columns, we need to convert label to index
						const board = await client.getBoard(boardId);
						const column = board.columns.find((col) => col.id === columnId);

						if (column && (column.type === 'status' || column.type === 'dropdown')) {
							const settings = JSON.parse(column.settings_str);
							const labels = settings.labels || {};

							// Find the index for this label
							const labelEntry = Object.entries(labels).find(([_, label]) => label === columnValue);
							if (labelEntry) {
								columnValue = labelEntry[0]; // Use the index instead of label
							}
						}

						const items = await client.getItemsByColumnValue(boardId, columnId, columnValue, limit);
						items.forEach((item) => returnData.push({ json: item }));
					} else if (operation === 'moveToGroup') {
						const itemId = this.getNodeParameter('itemId', i) as string;
						const groupId = this.getNodeParameter('groupId', i) as string;

						const item = await client.moveItemToGroup(itemId, groupId);
						returnData.push({ json: item });
					}
				} else if (resource === 'board') {
					if (operation === 'create') {
						const boardName = this.getNodeParameter('boardName', i) as string;
						const boardKind = this.getNodeParameter('boardKind', i) as string;
						const workspaceId = this.getNodeParameter('workspaceId', i, '') as string;
						const templateId = this.getNodeParameter('templateId', i, '') as string;

						const board = await client.createBoard(
							boardName,
							boardKind,
							workspaceId || undefined,
							templateId || undefined,
						);
						returnData.push({ json: board });
					} else if (operation === 'get') {
						const boardId = this.getNodeParameter('boardId', i) as string;

						const board = await client.getBoard(boardId);
						returnData.push({ json: board as any });
					} else if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						const boardIdsParam = this.getNodeParameter('boardIds', i, []) as string[] | string;

						// Handle both array (multiOptions) and string (legacy) formats
						let boardIds: string[] | undefined;
						if (Array.isArray(boardIdsParam)) {
							boardIds = boardIdsParam.length > 0 ? boardIdsParam : undefined;
						} else if (typeof boardIdsParam === 'string' && boardIdsParam) {
							boardIds = boardIdsParam.split(',').map((id) => id.trim());
						}

						const boards = await client.getBoards(returnAll ? 100 : limit);

						// Filter by IDs if provided
						const filteredBoards = boardIds
							? boards.filter(board => boardIds.includes(board.id))
							: boards;

						filteredBoards.forEach((board) => returnData.push({ json: board as any }));
					} else if (operation === 'archive') {
						const boardId = this.getNodeParameter('boardId', i) as string;

						// Archive board mutation
						const query = `
							mutation {
								archive_board(board_id: ${boardId}) {
									id
								}
							}
						`;
						const result = await client.executeQuery(query);
						returnData.push({ json: { success: true, boardId, archived: result.data.archive_board } });
					}
				} else if (resource === 'group') {
					if (operation === 'create') {
						const boardId = this.getNodeParameter('board', i) as string;
						const groupName = this.getNodeParameter('groupName', i) as string;

						const group = await client.createGroup(boardId, groupName);
						returnData.push({ json: group });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

/**
 * Parse formula value from JSON string
 */
function parseFormulaValue(value: string, type: string): any {
	if (!value) return null;

	try {
		const parsed = JSON.parse(value);

		if (typeof parsed === 'number') return parsed;
		if (typeof parsed === 'boolean') return parsed;
		if (parsed.date) return parsed.date;

		return parsed;
	} catch {
		return value;
	}
}
