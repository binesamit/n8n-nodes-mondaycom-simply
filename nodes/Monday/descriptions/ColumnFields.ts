import { INodeProperties } from 'n8n-workflow';

/**
 * Column field definitions for Simple Mode
 * Used in a fixedCollection to allow users to add only the columns they need
 */
export const columnFields: INodeProperties = {
	displayName: 'Column Values',
	name: 'columnValues',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			resource: ['item'],
			operation: ['create', 'update'],
			columnInputMode: ['columnByColumn'],
		},
	},
	default: {},
	placeholder: 'Add Column',
	options: [
		// Status Column
		{
			name: 'statusColumn',
			displayName: 'Status Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadStatusColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The status column to update',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadStatusValuesForSelectedColumn',
						loadOptionsDependsOn: ['column'],
					},
					default: '',
					description: 'The status value to set',
				},
			],
		},

		// Dropdown Column
		{
			name: 'dropdownColumn',
			displayName: 'Dropdown Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadDropdownColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The dropdown column to update',
				},
				{
					displayName: 'Values',
					name: 'values',
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadDropdownValuesForSelectedColumn',
						loadOptionsDependsOn: ['column'],
					},
					default: [],
					description: 'The dropdown values to set (multi-select)',
				},
			],
		},

		// People Column
		{
			name: 'peopleColumn',
			displayName: 'People Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadPeopleColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The people column to update',
				},
				{
					displayName: 'People',
					name: 'values',
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadUsersAndGuests',
					},
					default: [],
					description: 'Select users (👤) and guests (👥)',
				},
			],
		},

		// Board Relation Column
		{
			name: 'boardRelationColumn',
			displayName: 'Board Relation',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadBoardRelationColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The board relation column to update',
				},
				{
					displayName: 'Related Items',
					name: 'values',
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadLinkedBoardItemsForSelectedColumn',
						loadOptionsDependsOn: ['column'],
					},
					default: [],
					description: 'Items from the linked board',
				},
			],
		},

		// Timeline Column
		{
			name: 'timelineColumn',
			displayName: 'Timeline',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadTimelineColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The timeline column to update',
				},
				{
					displayName: 'Start Date',
					name: 'startDate',
					type: 'dateTime',
					default: '',
					description: 'Timeline start date',
				},
				{
					displayName: 'End Date',
					name: 'endDate',
					type: 'dateTime',
					default: '',
					description: 'Timeline end date',
				},
			],
		},

		// Text Column
		{
			name: 'textColumn',
			displayName: 'Text Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The text column to update',
				},
				{
					displayName: 'Text Value',
					name: 'value',
					type: 'string',
					default: '',
					description: 'The text value to set',
				},
			],
		},

		// Number Column
		{
			name: 'numberColumn',
			displayName: 'Number Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The number column to update',
				},
				{
					displayName: 'Number Value',
					name: 'value',
					type: 'number',
					default: 0,
					description: 'The number value to set',
				},
			],
		},

		// Date Column
		{
			name: 'dateColumn',
			displayName: 'Date Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The date column to update',
				},
				{
					displayName: 'Date Value',
					name: 'value',
					type: 'dateTime',
					default: '',
					description: 'The date value to set',
				},
			],
		},

		// Checkbox Column
		{
			name: 'checkboxColumn',
			displayName: 'Checkbox Column',
			values: [
				{
					displayName: 'Column',
					name: 'column',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadColumns',
						loadOptionsDependsOn: ['board'],
					},
					default: '',
					description: 'The checkbox column to update',
				},
				{
					displayName: 'Checked',
					name: 'value',
					type: 'boolean',
					default: false,
					description: 'Whether the checkbox is checked',
				},
			],
		},
	],
};

/**
 * File upload notice field
 */
export const fileUploadNotice: INodeProperties = {
	displayName: 'File Upload Notice',
	name: 'fileUploadNotice',
	type: 'notice',
	displayOptions: {
		show: {
			resource: ['item'],
			operation: ['create', 'update'],
			columnInputMode: ['columnByColumn'],
		},
	},
	default: '',
	description:
		'ℹ️ **File Upload Information**\n\n' +
		'To upload files to Monday.com:\n' +
		'1. First upload the file to a storage service (AWS S3, Google Drive, etc.)\n' +
		'2. Get a public URL for the file\n' +
		'3. Use the Advanced Mode (JSON) with this format:\n' +
		'```json\n' +
		'{\n' +
		'  "files": {\n' +
		'    "fileUrls": [\n' +
		'      {"url": "https://example.com/file.pdf", "name": "document.pdf"}\n' +
		'    ]\n' +
		'  }\n' +
		'}\n' +
		'```',
};
