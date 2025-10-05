import { INodeProperties } from 'n8n-workflow';

/**
 * Airtable-style collection for column values
 * Each item in the collection represents one column to update
 */
export const airtableStyleColumnFields: INodeProperties = {
	displayName: 'Fields to Send',
	name: 'fieldsToSend',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	placeholder: 'Add Field',
	default: {},
	displayOptions: {
		show: {
			resource: ['item'],
			operation: ['create', 'update'],
			columnInputMode: ['simple'],
		},
	},
	options: [
		{
			name: 'field',
			displayName: 'Field',
			values: [
				{
					displayName: 'Column',
					name: 'columnId',
					type: 'string',
					default: '',
					required: true,
					description: 'The column ID to update',
					typeOptions: {
						loadOptionsMethod: 'loadBoardColumnsAsCollectionOptions',
						loadOptionsDependsOn: ['board'],
					},
				},
				// Status field value
				{
					displayName: 'Status Value',
					name: 'statusValue',
					type: 'options',
					displayOptions: {
						show: {
							columnId: ['/^status\\|\\|\\|/'],
						},
					},
					typeOptions: {
						loadOptionsMethod: 'loadStatusValuesForDynamicColumn',
						loadOptionsDependsOn: ['board', 'columnId'],
					},
					default: '',
					description: 'Select status value',
				},
				// Dropdown field value
				{
					displayName: 'Dropdown Values',
					name: 'dropdownValues',
					type: 'multiOptions',
					displayOptions: {
						show: {
							columnId: ['/^dropdown\\|\\|\\|/'],
						},
					},
					typeOptions: {
						loadOptionsMethod: 'loadDropdownValuesForDynamicColumn',
						loadOptionsDependsOn: ['board', 'columnId'],
					},
					default: [],
					description: 'Select dropdown values (multi-select)',
				},
				// People field value
				{
					displayName: 'People',
					name: 'peopleValues',
					type: 'multiOptions',
					displayOptions: {
						show: {
							columnId: ['/^people\\|\\|\\|/'],
						},
					},
					typeOptions: {
						loadOptionsMethod: 'loadUsersAndGuests',
					},
					default: [],
					description: 'Select users and guests',
				},
				// Board Relation field value
				{
					displayName: 'Related Items',
					name: 'boardRelationValues',
					type: 'multiOptions',
					displayOptions: {
						show: {
							columnId: ['/^board_relation\\|\\|\\|/'],
						},
					},
					typeOptions: {
						loadOptionsMethod: 'loadLinkedBoardItemsForDynamicColumn',
						loadOptionsDependsOn: ['board', 'columnId'],
					},
					default: [],
					description: 'Select items from linked board',
				},
				// Date field value
				{
					displayName: 'Date',
					name: 'dateValue',
					type: 'dateTime',
					displayOptions: {
						show: {
							columnId: ['/^date\\|\\|\\|/'],
						},
					},
					default: '',
					description: 'Select date',
				},
				// Timeline field values
				{
					displayName: 'Start Date',
					name: 'timelineStartDate',
					type: 'dateTime',
					displayOptions: {
						show: {
							columnId: ['/^timeline\\|\\|\\|/'],
						},
					},
					default: '',
					description: 'Timeline start date',
				},
				{
					displayName: 'End Date',
					name: 'timelineEndDate',
					type: 'dateTime',
					displayOptions: {
						show: {
							columnId: ['/^timeline\\|\\|\\|/'],
						},
					},
					default: '',
					description: 'Timeline end date',
				},
				// Number field value
				{
					displayName: 'Number',
					name: 'numberValue',
					type: 'number',
					displayOptions: {
						show: {
							columnId: ['/^numbers\\|\\|\\|/'],
						},
					},
					default: 0,
					description: 'Enter number value',
				},
				// Text field value
				{
					displayName: 'Text',
					name: 'textValue',
					type: 'string',
					displayOptions: {
						show: {
							columnId: ['/^text\\|\\|\\|/', '/^long_text\\|\\|\\|/', '/^email\\|\\|\\|/', '/^phone\\|\\|\\|/', '/^link\\|\\|\\|/'],
						},
					},
					default: '',
					description: 'Enter text value',
				},
				// Checkbox field value
				{
					displayName: 'Checked',
					name: 'checkboxValue',
					type: 'boolean',
					displayOptions: {
						show: {
							columnId: ['/^checkbox\\|\\|\\|/'],
						},
					},
					default: false,
					description: 'Whether the checkbox is checked',
				},
				// Rating field value
				{
					displayName: 'Rating',
					name: 'ratingValue',
					type: 'number',
					displayOptions: {
						show: {
							columnId: ['/^rating\\|\\|\\|/'],
						},
					},
					typeOptions: {
						minValue: 1,
						maxValue: 5,
					},
					default: 3,
					description: 'Rating value (1-5)',
				},
			],
		},
	],
};
