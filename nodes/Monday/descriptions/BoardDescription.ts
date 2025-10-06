import { INodeProperties } from 'n8n-workflow';

export const boardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['board'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a board',
				action: 'Archive a board',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new board',
				action: 'Create a board',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a board',
				action: 'Get a board',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many boards',
				action: 'Get many boards',
			},
		],
		default: 'get',
	},
];

export const boardFields: INodeProperties[] = [
	// Archive Board
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['archive', 'get'],
			},
		},
		default: '',
		description: 'The ID of the board',
	},

	// Create Board
	{
		displayName: 'Board Name',
		name: 'boardName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the new board',
	},
	{
		displayName: 'Board Kind',
		name: 'boardKind',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Public',
				value: 'public',
			},
			{
				name: 'Private',
				value: 'private',
			},
			{
				name: 'Share',
				value: 'share',
			},
		],
		default: 'public',
		description: 'The board kind',
	},
	{
		displayName: 'Workspace ID',
		name: 'workspaceId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The workspace ID (optional)',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Create board from template (optional)',
	},

	// Get Many Boards
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['getMany'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Board IDs',
		name: 'boardIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['getMany'],
			},
		},
		default: '',
		description: 'Comma-separated list of board IDs (leave empty for all boards)',
		placeholder: '123456,789012',
	},
];
