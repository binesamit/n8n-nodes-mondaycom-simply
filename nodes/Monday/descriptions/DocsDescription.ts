import { INodeProperties } from 'n8n-workflow';

export const docsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['docs'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new doc',
				action: 'Create a doc',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a doc',
				action: 'Delete a doc',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a doc',
				action: 'Get a doc',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a doc',
				action: 'Update a doc',
			},
		],
		default: 'create',
	},
];

export const docsFields: INodeProperties[] = [
	// Create Doc
	{
		displayName: 'Location',
		name: 'location',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Workspace',
				value: 'workspace',
			},
			{
				name: 'Folder',
				value: 'folder',
			},
		],
		default: 'workspace',
		description: 'Where to create the doc',
	},
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
				resource: ['docs'],
				operation: ['create'],
				location: ['workspace'],
			},
		},
		default: '',
		description: 'The workspace where the doc will be created',
	},
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
				location: ['folder'],
			},
		},
		default: '',
		description: 'The folder ID where the doc will be created',
		placeholder: '2015797',
	},
	{
		displayName: 'Doc Name',
		name: 'docName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the new doc',
	},
	{
		displayName: 'Doc Kind',
		name: 'docKind',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['docs'],
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
		],
		default: 'public',
		description: 'The doc visibility',
	},

	// Get/Delete/Update Doc
	{
		displayName: 'Doc ID',
		name: 'docId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['get', 'delete', 'update'],
			},
		},
		default: '',
		description: 'ID of the doc',
		placeholder: '123456789',
	},

	// Update Doc
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Doc Name',
				name: 'docName',
				type: 'string',
				default: '',
				description: 'New name for the doc',
			},
		],
	},

	// Blocks (API 2025-01+)
	{
		displayName: 'Add Blocks',
		name: 'addBlocks',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create', 'update'],
			},
		},
		default: false,
		description: 'Whether to add content blocks to the doc (requires API version 2025-01+)',
	},
	{
		displayName: 'Blocks',
		name: 'blocks',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create', 'update'],
				addBlocks: [true],
			},
		},
		default: {},
		placeholder: 'Add Block',
		options: [
			{
				name: 'blockItems',
				displayName: 'Block',
				values: [
					{
						displayName: 'Block Type',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'Normal Text',
								value: 'normal_text',
							},
							{
								name: 'Large Title',
								value: 'large_title',
							},
							{
								name: 'Medium Title',
								value: 'medium_title',
							},
							{
								name: 'Small Title',
								value: 'small_title',
							},
							{
								name: 'Quote',
								value: 'quote',
							},
							{
								name: 'Bulleted List',
								value: 'bulleted_list',
							},
							{
								name: 'Numbered List',
								value: 'numbered_list',
							},
							{
								name: 'Check List',
								value: 'check_list',
							},
							{
								name: 'Code',
								value: 'code',
							},
							{
								name: 'Divider',
								value: 'divider',
							},
							{
								name: 'Image',
								value: 'image',
							},
							{
								name: 'Video',
								value: 'video',
							},
							{
								name: 'Layout',
								value: 'layout',
							},
						],
						default: 'normal_text',
						description: 'Type of content block',
					},
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'The text content of the block',
						displayOptions: {
							hide: {
								type: ['divider', 'layout'],
							},
						},
					},
					{
						displayName: 'Delta Format',
						name: 'deltaFormat',
						type: 'json',
						displayOptions: {
							show: {
								type: ['normal_text', 'large_title', 'medium_title', 'small_title', 'quote', 'bulleted_list', 'numbered_list'],
							},
						},
						default: '',
						description: 'Rich text content in Delta format (advanced)',
						placeholder: '{"ops": [{"insert": "Hello world"}]}',
					},
				],
			},
		],
		description: 'Content blocks to add to the doc',
	},
];
