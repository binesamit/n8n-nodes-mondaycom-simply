import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Extract column ID from combined value (type|||columnId)
 */
function extractColumnId(combinedValue: string): string {
	const parts = combinedValue.split('|||');
	return parts.length > 1 ? parts[1] : combinedValue;
}

/**
 * Build column values from Simple Mode unified fields
 */
export function buildColumnValuesFromSimpleMode(
	context: IExecuteFunctions,
	itemIndex: number,
): Record<string, any> {
	const columnValues: Record<string, any> = {};

	// Get the fieldsToSend fixedCollection
	const fieldsToSend = context.getNodeParameter('fieldsToSend', itemIndex, {}) as any;

	if (!fieldsToSend || !fieldsToSend.field || !Array.isArray(fieldsToSend.field)) {
		return columnValues;
	}

	// Process each field
	for (const field of fieldsToSend.field) {
		const columnIdCombined = field.columnId as string;
		if (!columnIdCombined) continue;

		const columnId = extractColumnId(columnIdCombined);
		const columnType = columnIdCombined.split('|||')[0];

		// Build value based on which field the user filled
		// Check each possible value field and use the appropriate one

		// Single select (Status)
		if (field.selectValue) {
			columnValues[columnId] = { label: field.selectValue };
		}
		// Multi-select (Dropdown, People, Board Relation)
		else if (field.multiSelectValues && field.multiSelectValues.length > 0) {
			switch (columnType) {
				case 'dropdown':
					columnValues[columnId] = { labels: field.multiSelectValues };
					break;
				case 'people':
					columnValues[columnId] = {
						personsAndTeams: field.multiSelectValues.map((id: string) => ({
							id,
							kind: id.startsWith('team_') ? 'team' : 'person',
						})),
					};
					break;
				case 'board_relation':
					columnValues[columnId] = {
						linkedPulseIds: field.multiSelectValues.map((id: string) => ({
							linkedPulseId: parseInt(id, 10),
						})),
					};
					break;
			}
		}
		// Text value
		else if (field.textValue !== undefined && field.textValue !== '') {
			columnValues[columnId] = field.textValue;
		}
		// Number value
		else if (field.numberValue !== undefined && field.numberValue !== 0) {
			columnValues[columnId] = field.numberValue;
		}
		// Date value
		else if (field.dateValue) {
			columnValues[columnId] = { date: field.dateValue };
		}
		// Timeline
		else if (field.timelineStart && field.timelineEnd) {
			columnValues[columnId] = {
				from: field.timelineStart,
				to: field.timelineEnd,
			};
		}
		// Checkbox
		else if (field.checkboxValue !== undefined) {
			columnValues[columnId] = { checked: field.checkboxValue ? 'true' : 'false' };
		}
	}

	return columnValues;
}
