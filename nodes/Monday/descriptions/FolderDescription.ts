import { INodeProperties } from 'n8n-workflow';

export const folderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['folder'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new folder',
				action: 'Create a folder',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a folder',
				action: 'Delete a folder',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a folder',
				action: 'Update a folder',
			},
		],
		default: 'create',
	},
];

export const folderFields: INodeProperties[] = [
	// Create Folder
	{
		displayName: 'Workspace',
		name: 'workspaceId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadWorkspaces',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The workspace where the folder will be created',
	},
	{
		displayName: 'Folder Name',
		name: 'folderName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the new folder',
	},
	{
		displayName: 'Folder Color',
		name: 'folderColor',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{ name: 'Default', value: 'null' },
			{ name: 'Red', value: 'RED' },
			{ name: 'Orange', value: 'ORANGE' },
			{ name: 'Yellow', value: 'YELLOW' },
			{ name: 'Green', value: 'GREEN' },
			{ name: 'Blue', value: 'BLUE' },
			{ name: 'Purple', value: 'PURPLE' },
			{ name: 'Pink', value: 'PINK' },
			{ name: 'Dark Purple', value: 'DARK_PURPLE' },
		],
		default: 'null',
		description: 'Color of the folder',
	},

	// Update Folder
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'ID of the folder to update/delete',
	},
	{
		displayName: 'Folder Name',
		name: 'folderName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New name for the folder (optional)',
	},
];
