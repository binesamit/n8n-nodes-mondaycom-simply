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

		// Check if this is a timeline object with from/to
		if (typeof value === 'object' && 'from' in value && 'to' in value) {
			// Timeline column
			transformedValues[columnId] = {
				from: value.from,
				to: value.to,
			};
		}
		// Check if this is an array (multiOptions for board-relation)
		else if (Array.isArray(value)) {
			// Board Relation column - transform array of IDs to linkedPulseIds format
			transformedValues[columnId] = {
				linkedPulseIds: value.map((id) => ({
					linkedPulseId: typeof id === 'string' ? parseInt(id, 10) : id,
				})),
			};
		}
		// Check if this is a number
		else if (typeof value === 'number') {
			// Number column - keep as is
			transformedValues[columnId] = value;
		}
		// Everything else (status, dropdown, text, etc.)
		else {
			transformedValues[columnId] = value;
		}
	}

	return transformedValues;
}
