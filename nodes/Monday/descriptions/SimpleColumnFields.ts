import { INodeProperties } from 'n8n-workflow';

/**
 * Simple approach: One value field that changes based on column selection
 * We'll use conditional logic in the code to handle different column types
 */
export const simpleColumnFields: INodeProperties = {
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
						loadOptionsMethod: 'loadBoardColumnsWithType',
						loadOptionsDependsOn: ['board'],
					},
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					description: 'The value to set. For complex types (People, Board Relation, etc.), see documentation.',
					placeholder: 'Enter value or expression',
				},
			],
		},
	],
};
