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
		],
		default: 'create',
	},
];

export const docsFields: INodeProperties[] = [
	// Create Doc
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
			},
		},
		default: '',
		description: 'The workspace where the doc will be created',
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
		description: 'Name for the new doc',
		placeholder: 'My New Doc',
	},
	{
		displayName: 'Doc Kind',
		name: 'docKind',
		type: 'options',
		options: [
			{
				name: 'Private',
				value: 'private',
			},
			{
				name: 'Public',
				value: 'public',
			},
		],
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
			},
		},
		default: 'private',
		description: 'Privacy setting for the doc',
	},
	{
		displayName: 'Place in Folder',
		name: 'useFolder',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to place the doc in a specific folder',
	},
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
				useFolder: [true],
			},
		},
		default: '',
		description: 'The folder ID where the doc will be created (optional)',
		placeholder: '2015797',
	},

	// Get/Delete Doc
	{
		displayName: 'Doc ID',
		name: 'docId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['get', 'delete'],
			},
		},
		default: '',
		description: 'ID of the doc',
		placeholder: '123456789',
	},

	// Blocks (API 2025-01+)
	{
		displayName: 'Add Blocks',
		name: 'addBlocks',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['docs'],
				operation: ['create'],
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
				operation: ['create'],
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
