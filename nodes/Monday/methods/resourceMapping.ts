import {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	ResourceMapperFields,
	FieldType,
	ResourceMapperField,
} from 'n8n-workflow';
import { MondayApiClient } from '../utils/apiClient';

/**
 * Load fields for resource mapper based on selected board
 */
export async function getMondayBoardFields(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	const boardId = this.getNodeParameter('board', 0) as string;

	if (!boardId) {
		return { fields: [] };
	}

	const credentials = await this.getCredentials('mondayApi');
	const apiVersion = (credentials.apiVersion as string) || '2023-10';
	const autoUpgrade = (credentials.autoUpgrade as boolean) ?? true;

	const client = new MondayApiClient(
		credentials.apiToken as string,
		apiVersion,
		autoUpgrade,
	);

	const board = await client.getBoard(boardId);
	const fields: ResourceMapperField[] = [];

	// System columns to exclude
	const systemColumns = ['name', 'subitems'];
	// Read-only column types to exclude
	const readOnlyTypes = ['mirror', 'formula', 'auto_number', 'creation_log', 'last_updated'];

	// Map each column to a resource mapper field
	for (const column of board.columns) {
		// Skip system columns and read-only columns
		if (systemColumns.includes(column.id) || readOnlyTypes.includes(column.type)) {
			continue;
		}

		const field: ResourceMapperField = {
			id: column.id,
			displayName: column.title,
			required: false,
			defaultMatch: false,
			display: true,
			canBeUsedToMatch: false,
		};

		// Set field type based on column type
		switch (column.type) {
			case 'status':
				field.type = 'string' as FieldType;
				field.options = parseStatusOptions(column.settings_str);
				break;

			case 'dropdown':
				field.type = 'string' as FieldType;
				field.options = parseDropdownOptions(column.settings_str);
				break;

			case 'people':
				field.type = 'string' as FieldType;
				field.display = true;
				break;

			case 'date':
				field.type = 'dateTime' as FieldType;
				break;

			case 'timeline':
				field.type = 'object' as FieldType;
				break;

			case 'numbers':
				field.type = 'number' as FieldType;
				break;

			case 'text':
			case 'long_text':
				field.type = 'string' as FieldType;
				break;

			case 'email':
				field.type = 'string' as FieldType;
				break;

			case 'phone':
				field.type = 'string' as FieldType;
				break;

			case 'link':
				field.type = 'string' as FieldType;
				break;

			case 'checkbox':
				field.type = 'boolean' as FieldType;
				break;

			case 'rating':
				field.type = 'number' as FieldType;
				break;

			case 'board_relation':
				field.type = 'string' as FieldType;
				break;

			default:
				field.type = 'string' as FieldType;
		}

		fields.push(field);
	}

	return { fields };
}

/**
 * Parse status column options from settings string
 */
function parseStatusOptions(settingsStr: string): INodePropertyOptions[] {
	try {
		const settings = JSON.parse(settingsStr);
		const labels = settings.labels || {};

		return Object.entries(labels).map(([index, label]) => ({
			name: label as string,
			value: label as string,
		}));
	} catch (error) {
		return [];
	}
}

/**
 * Parse dropdown column options from settings string
 */
function parseDropdownOptions(settingsStr: string): INodePropertyOptions[] {
	try {
		const settings = JSON.parse(settingsStr);
		const labels = settings.labels || [];

		return labels.map((label: any) => ({
			name: typeof label === 'string' ? label : label.name,
			value: typeof label === 'string' ? label : label.id,
		}));
	} catch (error) {
		return [];
	}
}
