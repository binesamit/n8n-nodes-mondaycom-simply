import { INodeProperties } from 'n8n-workflow';

/**
 * Unified approach: Show all possible value fields, user fills only relevant ones
 * This is simpler and more reliable than conditional display
 */
export const unifiedColumnFields: INodeProperties = {
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
					type: 'options',
					default: '',
					required: true,
					description: 'Select the column to update',
					typeOptions: {
						loadOptionsMethod: 'loadBoardColumnsAsCollectionOptions',
						loadOptionsDependsOn: ['board'],
					},
				},
				// Status/Dropdown - Single select
				{
					displayName: 'Select Value',
					name: 'selectValue',
					type: 'options',
					typeOptions: {
						loadOptionsMethod: 'loadColumnOptionsForSelected',
						loadOptionsDependsOn: ['board', 'columnId'],
					},
					default: '',
					description: 'For Status/Dropdown columns - select a single value',
					hint: 'Use this for Status columns',
				},
				// Dropdown/People/Board Relation - Multi select
				{
					displayName: 'Multi Select Values',
					name: 'multiSelectValues',
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadColumnMultiOptionsForSelected',
						loadOptionsDependsOn: ['board', 'columnId'],
					},
					default: [],
					description: 'For Dropdown/People/Board Relation columns - select multiple values',
					hint: 'Use this for People, Dropdown (multi), or Board Relation columns',
				},
				// Text input
				{
					displayName: 'Text Value',
					name: 'textValue',
					type: 'string',
					default: '',
					description: 'For Text/Email/Phone/Link columns - enter text',
					hint: 'Use this for Text, Email, Phone, Link columns',
				},
				// Number input
				{
					displayName: 'Number Value',
					name: 'numberValue',
					type: 'number',
					default: 0,
					description: 'For Number/Rating columns - enter a number',
					hint: 'Use this for Number or Rating columns',
				},
				// Date input
				{
					displayName: 'Date Value',
					name: 'dateValue',
					type: 'dateTime',
					default: '',
					description: 'For Date columns - select a date',
					hint: 'Use this for Date columns',
				},
				// Timeline start
				{
					displayName: 'Timeline Start Date',
					name: 'timelineStart',
					type: 'dateTime',
					default: '',
					description: 'For Timeline columns - select start date',
					hint: 'Use this for Timeline columns (start date)',
				},
				// Timeline end
				{
					displayName: 'Timeline End Date',
					name: 'timelineEnd',
					type: 'dateTime',
					default: '',
					description: 'For Timeline columns - select end date',
					hint: 'Use this for Timeline columns (end date)',
				},
				// Checkbox
				{
					displayName: 'Checkbox Value',
					name: 'checkboxValue',
					type: 'boolean',
					default: false,
					description: 'For Checkbox columns - check or uncheck',
					hint: 'Use this for Checkbox columns',
				},
			],
		},
	],
};
