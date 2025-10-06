import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Build column values from Column by Column Mode (fixedCollection)
 * Reads data from ColumnFields fixedCollection and builds Monday.com column values
 */
export function buildColumnValuesFromColumnByColumn(
	context: IExecuteFunctions,
	itemIndex: number,
): Record<string, any> {
	const columnValues: Record<string, any> = {};

	// Get the fixedCollection data
	const columnData = context.getNodeParameter('columnValues', itemIndex, {}) as any;

	// Status columns
	if (columnData.statusColumn && Array.isArray(columnData.statusColumn)) {
		for (const statusCol of columnData.statusColumn) {
			const columnId = statusCol.column;
			const value = statusCol.value;
			if (columnId && value) {
				columnValues[columnId] = { label: value };
			}
		}
	}

	// Dropdown columns
	if (columnData.dropdownColumn && Array.isArray(columnData.dropdownColumn)) {
		for (const dropdownCol of columnData.dropdownColumn) {
			const columnId = dropdownCol.column;
			const values = dropdownCol.values;
			if (columnId && values && values.length > 0) {
				columnValues[columnId] = { labels: values };
			}
		}
	}

	// People columns
	if (columnData.peopleColumn && Array.isArray(columnData.peopleColumn)) {
		for (const peopleCol of columnData.peopleColumn) {
			const columnId = peopleCol.column;
			const values = peopleCol.values;
			if (columnId && values && values.length > 0) {
				columnValues[columnId] = {
					personsAndTeams: values.map((id: string) => ({
						id,
						kind: id.startsWith('team_') ? 'team' : 'person',
					})),
				};
			}
		}
	}

	// Board Relation columns
	if (columnData.boardRelationColumn && Array.isArray(columnData.boardRelationColumn)) {
		for (const boardRelCol of columnData.boardRelationColumn) {
			const columnId = boardRelCol.column;
			const values = boardRelCol.values;
			if (columnId && values && values.length > 0) {
				columnValues[columnId] = {
					linkedPulseIds: values.map((id: string) => ({
						linkedPulseId: parseInt(id, 10),
					})),
				};
			}
		}
	}

	// Timeline columns
	if (columnData.timelineColumn && Array.isArray(columnData.timelineColumn)) {
		for (const timelineCol of columnData.timelineColumn) {
			const columnId = timelineCol.column;
			const startDate = timelineCol.startDate;
			const endDate = timelineCol.endDate;
			if (columnId && startDate && endDate) {
				columnValues[columnId] = {
					from: startDate,
					to: endDate,
				};
			}
		}
	}

	// Text columns
	if (columnData.textColumn && Array.isArray(columnData.textColumn)) {
		for (const textCol of columnData.textColumn) {
			const columnId = textCol.column;
			const value = textCol.value;
			if (columnId && value !== undefined && value !== '') {
				columnValues[columnId] = value;
			}
		}
	}

	// Number columns
	if (columnData.numberColumn && Array.isArray(columnData.numberColumn)) {
		for (const numberCol of columnData.numberColumn) {
			const columnId = numberCol.column;
			const value = numberCol.value;
			if (columnId && value !== undefined && value !== '') {
				columnValues[columnId] = typeof value === 'string' ? parseFloat(value) : value;
			}
		}
	}

	// Date columns
	if (columnData.dateColumn && Array.isArray(columnData.dateColumn)) {
		for (const dateCol of columnData.dateColumn) {
			const columnId = dateCol.column;
			const value = dateCol.value;
			if (columnId && value) {
				columnValues[columnId] = { date: value };
			}
		}
	}

	// Checkbox columns
	if (columnData.checkboxColumn && Array.isArray(columnData.checkboxColumn)) {
		for (const checkboxCol of columnData.checkboxColumn) {
			const columnId = checkboxCol.column;
			const value = checkboxCol.value;
			if (columnId && value !== undefined) {
				columnValues[columnId] = { checked: value ? 'true' : 'false' };
			}
		}
	}

	// Free columns (any type with string input)
	if (columnData.freeColumn && Array.isArray(columnData.freeColumn)) {
		for (const freeCol of columnData.freeColumn) {
			const columnId = freeCol.column;
			const value = freeCol.value;
			if (columnId && value !== undefined && value !== '') {
				// Try to parse as JSON if it looks like JSON
				let processedValue = value;
				if (typeof value === 'string') {
					const trimmed = value.trim();
					if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
						try {
							processedValue = JSON.parse(trimmed);
						} catch (e) {
							// Keep as string if parsing fails
							processedValue = value;
						}
					}
				}
				columnValues[columnId] = processedValue;
			}
		}
	}

	return columnValues;
}
