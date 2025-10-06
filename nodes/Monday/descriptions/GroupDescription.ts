import { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new group in a board',
				action: 'Create a board group',
			},
		],
		default: 'create',
	},
];

export const groupFields: INodeProperties[] = [
	// Create Group
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
				resource: ['group'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The board to create the group in',
	},
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the new group',
	},
];
