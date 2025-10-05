import { IExecuteFunctions } from 'n8n-workflow';

interface ColumnValueField {
	column: string;
	value?: any;
	values?: any[];
	startDate?: string;
	endDate?: string;
}

/**
 * Build column values from Simple Mode fixedCollection UI fields
 */
export function buildColumnValuesFromSimpleMode(
	context: IExecuteFunctions,
	itemIndex: number,
): Record<string, any> {
	const columnValues: Record<string, any> = {};

	// Get the columnValues fixedCollection
	const columns = context.getNodeParameter('columnValues', itemIndex, {}) as any;

	// Status columns
	if (columns.statusColumn && Array.isArray(columns.statusColumn)) {
		columns.statusColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.value) {
				columnValues[field.column] = { label: field.value };
			}
		});
	}

	// Dropdown columns
	if (columns.dropdownColumn && Array.isArray(columns.dropdownColumn)) {
		columns.dropdownColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.values && field.values.length > 0) {
				columnValues[field.column] = { labels: field.values };
			}
		});
	}

	// People columns
	if (columns.peopleColumn && Array.isArray(columns.peopleColumn)) {
		columns.peopleColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.values && field.values.length > 0) {
				columnValues[field.column] = {
					personsAndTeams: field.values.map((id: string) => ({
						id,
						kind: id.startsWith('team_') ? 'team' : 'person',
					})),
				};
			}
		});
	}

	// Board Relation columns
	if (columns.boardRelationColumn && Array.isArray(columns.boardRelationColumn)) {
		columns.boardRelationColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.values && field.values.length > 0) {
				columnValues[field.column] = {
					linkedPulseIds: field.values.map((id: string) => ({
						linkedPulseId: parseInt(id, 10),
					})),
				};
			}
		});
	}

	// Timeline columns
	if (columns.timelineColumn && Array.isArray(columns.timelineColumn)) {
		columns.timelineColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.startDate && field.endDate) {
				columnValues[field.column] = {
					from: field.startDate,
					to: field.endDate,
				};
			}
		});
	}

	// Text columns
	if (columns.textColumn && Array.isArray(columns.textColumn)) {
		columns.textColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.value !== undefined) {
				columnValues[field.column] = field.value;
			}
		});
	}

	// Number columns
	if (columns.numberColumn && Array.isArray(columns.numberColumn)) {
		columns.numberColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.value !== undefined) {
				columnValues[field.column] = field.value;
			}
		});
	}

	// Date columns
	if (columns.dateColumn && Array.isArray(columns.dateColumn)) {
		columns.dateColumn.forEach((field: ColumnValueField) => {
			if (field.column && field.value) {
				columnValues[field.column] = { date: field.value };
			}
		});
	}

	// Checkbox columns
	if (columns.checkboxColumn && Array.isArray(columns.checkboxColumn)) {
		columns.checkboxColumn.forEach((field: ColumnValueField) => {
			if (field.column) {
				columnValues[field.column] = { checked: field.value ? 'true' : 'false' };
			}
		});
	}

	return columnValues;
}
