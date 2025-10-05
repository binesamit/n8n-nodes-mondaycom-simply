import { INodeProperties } from 'n8n-workflow';

/**
 * Dynamic column fields that show ALL columns from selected board
 * Each column type gets appropriate UI field with dynamic values
 */
export const dynamicColumnFields: INodeProperties = {
	displayName: 'Column Values',
	name: 'columnValuesCollection',
	type: 'collection',
	placeholder: 'Add Column Value',
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
			displayName: 'Column',
			name: 'dynamicColumn',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'loadAllBoardColumns',
				loadOptionsDependsOn: ['board'],
			},
			default: '',
			description: 'Select a column to set its value',
		},
		{
			displayName: 'Value',
			name: 'dynamicValue',
			type: 'string',
			default: '',
			description: 'Enter the value for the selected column',
		},
	],
};
