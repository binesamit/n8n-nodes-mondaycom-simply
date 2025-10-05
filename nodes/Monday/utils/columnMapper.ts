import { INodeProperties, INodePropertyOptions, NodePropertyTypes } from 'n8n-workflow';
import { ColumnDefinition } from '../types/Monday.types';
import {
	StatusColumnValue,
	PeopleColumnValue,
	BoardRelationColumnValue,
	TimelineColumnValue,
	CheckboxColumnValue,
	MondayColumnType,
} from '../types/Column.types';

/**
 * Column Mapper - Maps Monday.com columns to n8n UI fields
 */
export class ColumnMapper {
	/**
	 * Map column to n8n UI field
	 */
	static mapColumnToUIField(column: ColumnDefinition): INodeProperties | INodeProperties[] {
		const baseField: Partial<INodeProperties> = {
			displayName: column.title,
			name: `column_${column.id}`,
			type: this.getFieldType(column.type as MondayColumnType),
			default: this.getDefaultValue(column.type as MondayColumnType),
			displayOptions: {
				show: {
					columnInputMode: ['simple'],
				},
			},
		};

		switch (column.type) {
			case 'status':
				return {
					...baseField,
					type: 'options',
					options: this.parseStatusOptions(column.settings_str),
					description: `Select status for ${column.title}`,
				} as INodeProperties;

			case 'dropdown':
				return {
					...baseField,
					type: 'options',
					options: this.parseDropdownOptions(column.settings_str),
					description: `Select value for ${column.title}`,
				} as INodeProperties;

			case 'board_relation':
				return {
					...baseField,
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadLinkedBoardItems',
						loadOptionsDependsOn: ['board'],
					},
					description: `Select related items for ${column.title}`,
				} as INodeProperties;

			case 'people':
				return {
					...baseField,
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadUsers',
					},
					description: `Select people/teams for ${column.title}`,
				} as INodeProperties;

			case 'date':
				return {
					...baseField,
					type: 'dateTime',
					description: `Set date for ${column.title}`,
				} as INodeProperties;

			case 'timeline':
				return [
					{
						...baseField,
						displayName: `${column.title} - From`,
						name: `${baseField.name}_from`,
						type: 'dateTime',
						description: `Set start date for ${column.title}`,
					} as INodeProperties,
					{
						...baseField,
						displayName: `${column.title} - To`,
						name: `${baseField.name}_to`,
						type: 'dateTime',
						description: `Set end date for ${column.title}`,
					} as INodeProperties,
				];

			case 'numbers':
				return {
					...baseField,
					type: 'number',
					description: `Enter number for ${column.title}`,
				} as INodeProperties;

			case 'text':
				return {
					...baseField,
					type: 'string',
					description: `Enter text for ${column.title}`,
				} as INodeProperties;

			case 'long_text':
				return {
					...baseField,
					type: 'string',
					typeOptions: {
						rows: 4,
					},
					description: `Enter long text for ${column.title}`,
				} as INodeProperties;

			case 'email':
				return {
					...baseField,
					type: 'string',
					placeholder: 'email@example.com',
					description: `Enter email for ${column.title}`,
				} as INodeProperties;

			case 'phone':
				return {
					...baseField,
					type: 'string',
					placeholder: '+1234567890',
					description: `Enter phone number for ${column.title}`,
				} as INodeProperties;

			case 'link':
				return [
					{
						...baseField,
						displayName: `${column.title} - URL`,
						name: `${baseField.name}_url`,
						type: 'string',
						placeholder: 'https://example.com',
						description: `Enter URL for ${column.title}`,
					} as INodeProperties,
					{
						...baseField,
						displayName: `${column.title} - Text`,
						name: `${baseField.name}_text`,
						type: 'string',
						default: '',
						description: `Enter link text for ${column.title}`,
					} as INodeProperties,
				];

			case 'checkbox':
				return {
					...baseField,
					type: 'boolean',
					description: `Check/uncheck ${column.title}`,
				} as INodeProperties;

			case 'rating':
				return {
					...baseField,
					type: 'number',
					typeOptions: {
						minValue: 1,
						maxValue: 5,
					},
					description: `Rate from 1-5 for ${column.title}`,
				} as INodeProperties;

			case 'tags':
				return {
					...baseField,
					type: 'multiOptions',
					typeOptions: {
						loadOptionsMethod: 'loadTags',
						loadOptionsDependsOn: ['board'],
					},
					description: `Select tags for ${column.title}`,
				} as INodeProperties;

			default:
				return {
					...baseField,
					type: 'string',
					description: `Enter value for ${column.title} (${column.type})`,
				} as INodeProperties;
		}
	}

	/**
	 * Map value from UI to Monday API format
	 */
	static mapValueToMondayFormat(
		columnType: MondayColumnType,
		value: any,
		settings?: string,
	): any {
		if (value === null || value === undefined || value === '') {
			return null;
		}

		switch (columnType) {
			case 'status':
				return { label: value } as StatusColumnValue;

			case 'dropdown':
				return { labels: Array.isArray(value) ? value : [value] };

			case 'board_relation':
			case 'dependency':
				const ids = Array.isArray(value) ? value : [value];
				return {
					linkedPulseIds: ids.map((id) => ({ linkedPulseId: parseInt(id, 10) })),
				} as BoardRelationColumnValue;

			case 'people':
				const people = Array.isArray(value) ? value : [value];
				return {
					personsAndTeams: people.map((id: string) => ({
						id: id.toString(),
						kind: id.startsWith('team_') ? 'team' : 'person',
					})),
				} as PeopleColumnValue;

			case 'date':
				return { date: value };

			case 'timeline':
				return {
					from: value.from,
					to: value.to,
				} as TimelineColumnValue;

			case 'checkbox':
				return { checked: Boolean(value) } as CheckboxColumnValue;

			case 'numbers':
				return parseFloat(value);

			case 'text':
			case 'long_text':
				return value.toString();

			case 'email':
				return { email: value, text: value };

			case 'phone':
				return value.toString();

			case 'link':
				return { url: value.url, text: value.text || value.url };

			case 'rating':
				return { rating: Math.min(5, Math.max(1, parseInt(value, 10))) };

			case 'tags':
				return {
					tag_ids: Array.isArray(value) ? value.map((id: string) => parseInt(id, 10)) : [],
				};

			default:
				return value;
		}
	}

	/**
	 * Parse status options from settings_str
	 */
	private static parseStatusOptions(settingsStr: string): INodePropertyOptions[] {
		try {
			const settings = JSON.parse(settingsStr);
			if (!settings.labels) return [];

			return Object.entries(settings.labels).map(([index, label]) => ({
				name: label as string,
				value: index,
			}));
		} catch {
			return [];
		}
	}

	/**
	 * Parse dropdown options from settings_str
	 */
	private static parseDropdownOptions(settingsStr: string): INodePropertyOptions[] {
		try {
			const settings = JSON.parse(settingsStr);
			if (!settings.labels) return [];

			return settings.labels.map((label: any) => ({
				name: label.name || label,
				value: label.id || label,
			}));
		} catch {
			return [];
		}
	}

	/**
	 * Get field type for column type
	 */
	private static getFieldType(columnType: MondayColumnType): NodePropertyTypes {
		const typeMap: Record<MondayColumnType, NodePropertyTypes> = {
			status: 'options',
			dropdown: 'options',
			people: 'multiOptions',
			board_relation: 'multiOptions',
			date: 'dateTime',
			timeline: 'dateTime',
			numbers: 'number',
			text: 'string',
			long_text: 'string',
			link: 'string',
			email: 'string',
			phone: 'string',
			rating: 'number',
			checkbox: 'boolean',
			dependency: 'multiOptions',
			tags: 'multiOptions',
			hour: 'string',
			week: 'string',
			color_picker: 'string',
			file: 'string',
			formula: 'string',
		};
		return typeMap[columnType] || 'string';
	}

	/**
	 * Get default value for column type
	 */
	private static getDefaultValue(columnType: MondayColumnType): any {
		const defaults: Partial<Record<MondayColumnType, any>> = {
			checkbox: false,
			numbers: 0,
			rating: 3,
			people: [],
			board_relation: [],
			dependency: [],
			tags: [],
			text: '',
			long_text: '',
		};
		return defaults[columnType] ?? '';
	}

	/**
	 * Validate column value
	 */
	static validateColumnValue(
		columnType: MondayColumnType,
		value: any,
		required: boolean = false,
	): { valid: boolean; error?: string } {
		if (required && (value === null || value === undefined || value === '')) {
			return { valid: false, error: 'This field is required' };
		}

		switch (columnType) {
			case 'email':
				if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
					return { valid: false, error: 'Invalid email format' };
				}
				break;

			case 'link':
				if (value?.url && !/^https?:\/\/.+/.test(value.url)) {
					return { valid: false, error: 'Invalid URL format' };
				}
				break;

			case 'rating':
				const rating = parseInt(value, 10);
				if (rating < 1 || rating > 5) {
					return { valid: false, error: 'Rating must be between 1 and 5' };
				}
				break;

			case 'numbers':
				if (value && isNaN(parseFloat(value))) {
					return { valid: false, error: 'Invalid number format' };
				}
				break;
		}

		return { valid: true };
	}
}
