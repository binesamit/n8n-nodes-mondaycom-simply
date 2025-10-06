import { INodeProperties } from 'n8n-workflow';

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
				name: 'Add Update',
				value: 'addUpdate',
				description: 'Add an update (comment) to an item',
				action: 'Add update to an item',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new item',
				action: 'Create an item',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an item',
				action: 'Delete an item',
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
				name: 'Get by Column Value',
				value: 'getByColumnValue',
				description: 'Search items by column value',
				action: 'Get items by column value',
			},
			{
				name: 'Move to Group',
				value: 'moveToGroup',
				description: 'Move an item to a different group',
				action: 'Move item to group',
			},
			{
				name: 'Read Formula Columns',
				value: 'readFormula',
				description: 'Read calculated values from formula columns (requires API 2024-01+)',
				action: 'Read formula columns',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing item',
				action: 'Update an item',
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
				description: 'Select values using dynamic UI fields (limited to one column per type)',
			},
			{
				name: 'Smart (All Columns)',
				value: 'smart',
				description: 'Select any column from board with appropriate input field (via resourceMapper)',
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
			hide: {
				operation: ['getByColumnValue'],
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

	// Sub-item toggle
	{
		displayName: 'Create as Sub-Item',
		name: 'createAsSubItem',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to create this item as a sub-item of another item',
	},

	// Parent Item ID (when creating sub-item)
	{
		displayName: 'Parent Item',
		name: 'parentItemId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadItemsFromBoard',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create'],
				createAsSubItem: [true],
			},
		},
		default: '',
		description: 'The parent item for this sub-item',
		required: true,
	},

	// Item ID (for update/get/delete)
	{
		displayName: 'Item',
		name: 'itemId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadItemsFromBoard',
			loadOptionsDependsOn: ['board'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['update', 'get', 'delete'],
			},
		},
		default: '',
		description: 'The item to get/update/delete',
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

	// Smart mode - resourceMapper
	{
		displayName: 'Columns',
		name: 'columnsUi',
		type: 'resourceMapper',
		noDataExpression: true,
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['smart'],
			},
		},
		typeOptions: {
			loadOptionsDependsOn: ['board'],
			resourceMapper: {
				resourceMapperMethod: 'getBoardColumns',
				mode: 'add',
				fieldWords: {
					singular: 'column',
					plural: 'columns',
				},
				addAllFields: true,
				multiKeyMatch: false,
			},
		},
		description: 'Select columns and set values - all board columns with appropriate input types',
	},

	// Simple mode - Status Column
	{
		displayName: 'Status Column',
		name: 'statusColumn',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadStatusColumns',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: '',
		description: 'Select a status column to update',
	},
	{
		displayName: 'Status Value',
		name: 'statusValue',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadStatusValues',
			loadOptionsDependsOn: ['board', 'statusColumn'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: '',
		description: 'Select the status value',
	},

	// Dropdown Column
	{
		displayName: 'Dropdown Column',
		name: 'dropdownColumn',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadDropdownColumns',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: '',
		description: 'Select a dropdown column to update',
	},
	{
		displayName: 'Dropdown Values',
		name: 'dropdownValues',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'loadDropdownValues',
			loadOptionsDependsOn: ['board', 'dropdownColumn'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: [],
		description: 'Select dropdown values (multi-select)',
	},

	// People Column
	{
		displayName: 'People Column',
		name: 'peopleColumn',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadPeopleColumns',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: '',
		description: 'Select a people column to update',
	},
	{
		displayName: 'People',
		name: 'peopleValues',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'loadUsersAndGuests',
		},
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: [],
		description: 'Select users and guests',
	},

	// Board Relation Column
	{
		displayName: 'Board Relation Column',
		name: 'boardRelationColumn',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadBoardRelationColumns',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['simple'],
			},
		},
		default: '',
		description: 'Select a board relation column',
	},
	{
		displayName: 'Related Items',
		name: 'boardRelationValues',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'loadLinkedBoardItems',
			loadOptionsDependsOn: ['board', 'boardRelationColumn'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['simple'],
			},
		},
		default: [],
		description: 'Select items from the linked board (select a Board Relation Column first)',
	},

	// Timeline Column
	{
		displayName: 'Timeline Column',
		name: 'timelineColumn',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadTimelineColumns',
			loadOptionsDependsOn: ['board'],
		},
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['simple'],
			},
		},
		default: '',
		description: 'Select a timeline column',
	},
	{
		displayName: 'Timeline Start Date',
		name: 'timelineStartDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['simple'],
			},
		},
		default: '',
		description: 'Start date for timeline (select a Timeline Column first)',
	},
	{
		displayName: 'Timeline End Date',
		name: 'timelineEndDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['create', 'update'],
				columnInputMode: ['simple'],
			},
		},
		default: '',
		description: 'End date for timeline (select a Timeline Column first)',
	},

	// File Column Notice
	{
		displayName: 'File Upload',
		name: 'fileNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['item'],
			},
			hide: {
				operation: ['get', 'getAll', 'delete', 'readFormula', 'getByColumnValue', 'moveToGroup', 'addUpdate'],
				columnInputMode: ['advanced'],
			},
		},
		default: '',
		description:
			'ℹ️ To upload files to Monday.com:\n1. First upload the file to a storage service (S3, Dropbox, etc.)\n2. Get the public URL of the file\n3. Use the Monday.com API with the file URL\n4. File uploads require special handling - use Advanced mode with JSON',
	},

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

	// Add Update fields
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['addUpdate'],
			},
		},
		default: '',
		description: 'The ID of the item to add update to',
	},
	{
		displayName: 'Update Text',
		name: 'updateBody',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['addUpdate'],
			},
		},
		default: '',
		description: 'The text of the update (supports HTML)',
		placeholder: 'Task completed successfully!',
	},
	{
		displayName: 'Reply to Update ID',
		name: 'replyToId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['addUpdate'],
			},
		},
		default: '',
		description: 'ID of the update to reply to (optional - leave empty to create a new update)',
		placeholder: '123456789',
	},

	// Get by Column Value fields
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
				operation: ['getByColumnValue'],
			},
		},
		default: '',
		description: 'The board to search in',
	},
	{
		displayName: 'Column',
		name: 'columnId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadColumns',
			loadOptionsDependsOn: ['board'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getByColumnValue'],
			},
		},
		default: '',
		description: 'The column to search by',
	},
	{
		displayName: 'Column Value',
		name: 'columnValue',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getByColumnValue'],
			},
		},
		default: '',
		description: 'The value to search for',
		placeholder: 'Done',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getByColumnValue'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},

	// Move to Group fields
	{
		displayName: 'Board',
		name: 'board',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadBoardsForSelection',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['moveToGroup'],
			},
		},
		default: '',
		description: 'The board containing the item',
	},
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['moveToGroup'],
			},
		},
		default: '',
		description: 'The ID of the item to move',
	},
	{
		displayName: 'Group',
		name: 'groupId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadGroups',
			loadOptionsDependsOn: ['board'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['moveToGroup'],
			},
		},
		default: '',
		description: 'The destination group',
	},
];
