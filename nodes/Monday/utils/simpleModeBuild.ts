import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Extract column ID from combined value (type|||columnId)
 */
function extractColumnId(combinedValue: string): string {
	const parts = combinedValue.split('|||');
	return parts.length > 1 ? parts[1] : combinedValue;
}

/**
 * Build column values from Simple Mode Airtable-style fields
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

		// Build value based on column type
		switch (columnType) {
			case 'status':
				if (field.statusValue) {
					columnValues[columnId] = { label: field.statusValue };
				}
				break;

			case 'dropdown':
				if (field.dropdownValues && field.dropdownValues.length > 0) {
					columnValues[columnId] = { labels: field.dropdownValues };
				}
				break;

			case 'people':
				if (field.peopleValues && field.peopleValues.length > 0) {
					columnValues[columnId] = {
						personsAndTeams: field.peopleValues.map((id: string) => ({
							id,
							kind: id.startsWith('team_') ? 'team' : 'person',
						})),
					};
				}
				break;

			case 'board_relation':
				if (field.boardRelationValues && field.boardRelationValues.length > 0) {
					columnValues[columnId] = {
						linkedPulseIds: field.boardRelationValues.map((id: string) => ({
							linkedPulseId: parseInt(id, 10),
						})),
					};
				}
				break;

			case 'date':
				if (field.dateValue) {
					columnValues[columnId] = { date: field.dateValue };
				}
				break;

			case 'timeline':
				if (field.timelineStartDate && field.timelineEndDate) {
					columnValues[columnId] = {
						from: field.timelineStartDate,
						to: field.timelineEndDate,
					};
				}
				break;

			case 'numbers':
				if (field.numberValue !== undefined) {
					columnValues[columnId] = field.numberValue;
				}
				break;

			case 'text':
			case 'long_text':
			case 'email':
			case 'phone':
			case 'link':
				if (field.textValue !== undefined) {
					columnValues[columnId] = field.textValue;
				}
				break;

			case 'checkbox':
				columnValues[columnId] = { checked: field.checkboxValue ? 'true' : 'false' };
				break;

			case 'rating':
				if (field.ratingValue !== undefined) {
					columnValues[columnId] = field.ratingValue;
				}
				break;
		}
	}

	return columnValues;
}
