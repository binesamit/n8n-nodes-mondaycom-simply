import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Build column values from Smart Mode (resourceMapper) data
 * Handles special transformations for timeline, board-relation, and people columns
 */
export function buildColumnValuesFromSmartMode(
	context: IExecuteFunctions,
	itemIndex: number,
	boardId: string,
): Record<string, any> {
	const columnsData = context.getNodeParameter('columnsUi', itemIndex) as any;
	let columnValues: Record<string, any> = {};

	if (columnsData.mappingMode === 'defineBelow' && columnsData.value) {
		columnValues = columnsData.value;
	}

	// Transform column values based on Monday.com API requirements
	// We need to get column types from the board to know how to transform
	const transformedValues: Record<string, any> = {};

	for (const [columnId, value] of Object.entries(columnValues)) {
		if (value === null || value === undefined || value === '') {
			continue;
		}

		let processedValue = value;

		// Try to parse JSON strings
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

		// Check if this is a timeline object with from/to
		if (typeof processedValue === 'object' && 'from' in processedValue && 'to' in processedValue) {
			// Timeline column
			transformedValues[columnId] = {
				from: processedValue.from,
				to: processedValue.to,
			};
		}
		// Check if this is an array (multiOptions for board-relation)
		else if (Array.isArray(processedValue)) {
			// Board Relation column - transform array of IDs to linkedPulseIds format
			transformedValues[columnId] = {
				linkedPulseIds: processedValue.map((id) => ({
					linkedPulseId: typeof id === 'string' ? parseInt(id, 10) : id,
				})),
			};
		}
		// Check if this is a number
		else if (typeof processedValue === 'number') {
			// Number column - keep as is
			transformedValues[columnId] = processedValue;
		}
		// Everything else (status, dropdown, text, etc.)
		else {
			transformedValues[columnId] = processedValue;
		}
	}

	return transformedValues;
}
