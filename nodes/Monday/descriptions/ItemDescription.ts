import { INodeProperties } from 'n8n-workflow';
import { unifiedColumnFields } from './UnifiedColumnFields';
import { fileUploadNotice } from './ColumnFields';

export const itemOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['item'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new item',
				action: 'Create an item',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing item',
				action: 'Update an item',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an item',
				action: 'Get an item',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all items from a board',
				action: 'Get all items',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an item',
				action: 'Delete an item',
			},
			{
				name: 'Read Formula Columns',
				value: 'readFormula',
				description: 'Read calculated values from formula columns (requires API 2024-01+)',
				action: 'Read formula columns',
			},
		],
		default: 'create',
	},
];

export const itemFields: INodeProperties[] = [
	// Column Input Mode
	{
		displayName: 'Column Input Mode',
		name: 'columnInputMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				name: 'Advanced (JSON)',
				value: 'advanced',
				description: 'Enter column values as JSON (traditional method)',
			},
			{
				name: 'Simple (Dynamic UI)',
				value: 'simple',
				description: 'Select values using dynamic UI fields',
			},
		],
		default: 'advanced',
		description: 'How to input column values',
	},

	// Board selection
	{
		displayName: 'Board',
		name: 'board',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadBoards',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
			},
		},
		default: '',
		description: 'The board to work with',
	},

	// Item Name (for create)
	{
		displayName: 'Item Name',
		name: 'itemName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the new item',
	},

	// Item ID (for update/get/delete)
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['update', 'get', 'delete'],
			},
		},
		default: '',
		description: 'ID of the item',
	},

	// Advanced mode - JSON input
	{
		displayName: 'Column Values (JSON)',
		name: 'columnValuesJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['advanced'],
			},
		},
		default: '{}',
		description: 'Column values as JSON object',
		placeholder: '{"status": {"label": "Done"}, "text": "Hello"}',
	},

	// Simple mode - Unified column fields (shows all field types)
	unifiedColumnFields,
	fileUploadNotice,

	// Get All - Limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getAll'],
			},
		},
		default: 50,
		description: 'Max number of items to return',
	},

	// Read Formula - specific fields
	{
		displayName: 'Formula Columns',
		name: 'formulaColumns',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'loadFormulaColumns',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['readFormula'],
			},
		},
		default: [],
		description: 'Select which formula columns to read. Leave empty to read all formula columns.',
	},

	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['readFormula'],
			},
		},
		options: [
			{
				name: 'Calculated Value',
				value: 'value',
				description: 'Return the raw calculated value (number, date, etc.)',
			},
			{
				name: 'Formatted Text',
				value: 'text',
				description: 'Return the formatted text as displayed in Monday',
			},
			{
				name: 'Both',
				value: 'both',
				description: 'Return both value and text',
			},
		],
		default: 'value',
	},

	{
		displayName: 'Item IDs',
		name: 'itemIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['readFormula'],
			},
		},
		default: '',
		placeholder: '123456 or 123456,789012',
		description: 'Comma-separated list of item IDs. Leave empty for all items.',
	},
];
