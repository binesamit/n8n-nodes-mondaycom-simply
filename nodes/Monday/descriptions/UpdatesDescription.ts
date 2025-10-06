import { INodeProperties } from 'n8n-workflow';

export const updatesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['updates'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new update',
				action: 'Create an update',
			},
			{
				name: 'Create Reply',
				value: 'createReply',
				description: 'Reply to an existing update',
				action: 'Reply to update',
			},
			{
				name: 'Generate Mentions',
				value: 'generateMentions',
				description: 'Generate mentions list without creating update (for use in other nodes)',
				action: 'Generate mentions list',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get updates for an item',
				action: 'Get updates',
			},
		],
		default: 'create',
	},
];

export const updatesFields: INodeProperties[] = [
	// Create Update
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the item to add update to',
		placeholder: '123456789',
	},
	{
		displayName: 'Update Text',
		name: 'updateText',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The update text. Use @userid format to mention users (e.g., "Hello @12345678")',
		placeholder: 'Hello @12345678, please review this item',
	},
	{
		displayName: 'Parse User Mentions',
		name: 'parseUserMentions',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['create', 'createReply'],
			},
		},
		default: true,
		description: 'Whether to automatically parse @userid mentions and convert them to user tags',
	},

	// Create Reply
	{
		displayName: 'Update ID',
		name: 'updateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['createReply'],
			},
		},
		default: '',
		description: 'ID of the update to reply to',
		placeholder: '987654321',
	},
	{
		displayName: 'Reply Text',
		name: 'updateText',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['createReply'],
			},
		},
		default: '',
		description: 'The reply text. Use @userid format to mention users (e.g., "Hello @12345678")',
		placeholder: 'Hello @12345678, thanks for the update!',
	},

	// Generate Mentions
	{
		displayName: 'Text',
		name: 'updateText',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['generateMentions'],
			},
		},
		default: '',
		description: 'Text containing @userid mentions to parse',
		placeholder: 'Hello @12345678, @87654321',
	},

	// Get Updates
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'ID of the item to get updates from',
		placeholder: '123456789',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['updates'],
				operation: ['get'],
			},
		},
		default: 25,
		description: 'Maximum number of updates to return',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
];
