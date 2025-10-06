import { INodeProperties } from 'n8n-workflow';

export const usersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['users'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a user by ID',
				action: 'Get a user',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get all users',
				action: 'List users',
			},
		],
		default: 'list',
	},
];

export const usersFields: INodeProperties[] = [
	// Get User
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['users'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'ID of the user',
		placeholder: '12345678',
	},

	// List Users - Filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['users'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				default: '',
				description: 'Filter by specific email addresses (comma-separated)',
				placeholder: 'user1@example.com, user2@example.com',
			},
			{
				displayName: 'User IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Filter by specific user IDs (comma-separated)',
				placeholder: '12345678, 87654321',
			},
			{
				displayName: 'User Type',
				name: 'kind',
				type: 'options',
				options: [
					{
						name: 'All Users',
						value: 'all',
					},
					{
						name: 'Members (Non-Guests)',
						value: 'non_guests',
						description: 'All workspace members excluding guests',
					},
					{
						name: 'Guests Only',
						value: 'guests',
						description: 'Guest users only',
					},
					{
						name: 'Active Members',
						value: 'non_pending',
						description: 'Active workspace members (excluding pending invites)',
					},
				],
				default: 'all',
				description: 'Filter by user type. Note: To filter by Admin role, use the "Include Admin Status" field and filter results manually.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Maximum number of users to return',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Fuzzy search by name',
				placeholder: 'John',
			},
			{
				displayName: 'Newest First',
				name: 'newestFirst',
				type: 'boolean',
				default: false,
				description: 'Whether to list most recently created users first',
			},
		],
	},

	// Return Fields
	{
		displayName: 'Return Fields',
		name: 'returnFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['users'],
			},
		},
		options: [
			{
				displayName: 'Include Email',
				name: 'includeEmail',
				type: 'boolean',
				default: true,
				description: 'Whether to include user email',
			},
			{
				displayName: 'Include Account',
				name: 'includeAccount',
				type: 'boolean',
				default: true,
				description: 'Whether to include account information',
			},
			{
				displayName: 'Include Admin Status',
				name: 'includeIsAdmin',
				type: 'boolean',
				default: false,
				description: 'Whether to include admin status',
			},
			{
				displayName: 'Include Guest Status',
				name: 'includeIsGuest',
				type: 'boolean',
				default: false,
				description: 'Whether to include guest status',
			},
			{
				displayName: 'Include Photo',
				name: 'includePhoto',
				type: 'boolean',
				default: false,
				description: 'Whether to include profile photo URL',
			},
			{
				displayName: 'Include Teams',
				name: 'includeTeams',
				type: 'boolean',
				default: false,
				description: 'Whether to include team memberships',
			},
			{
				displayName: 'Include Created At',
				name: 'includeCreatedAt',
				type: 'boolean',
				default: false,
				description: 'Whether to include creation date',
			},
		],
	},
];
