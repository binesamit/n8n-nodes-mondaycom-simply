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
						name: 'Item',
						value: 'item',
					},
				],
				default: 'item',
			},
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
			// Value loaders for fixedCollection fields
			loadStatusValuesForSelectedColumn: loadOptionsExtended.loadStatusValuesForSelectedColumn,
			loadDropdownValuesForSelectedColumn:
				loadOptionsExtended.loadDropdownValuesForSelectedColumn,
			loadLinkedBoardItemsForSelectedColumn:
				loadOptionsExtended.loadLinkedBoardItemsForSelectedColumn,
			loadUsersAndGuests: loadOptionsExtended.loadUsersAndGuests,
			// Legacy methods (for backward compatibility)
			loadDropdownValues: loadOptionsExtended.loadDropdownValues,
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
