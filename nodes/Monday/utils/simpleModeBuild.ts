import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Build column values from Simple Mode resourceMapper UI fields
 */
export function buildColumnValuesFromSimpleMode(
	context: IExecuteFunctions,
	itemIndex: number,
): Record<string, any> {
	const columnValues: Record<string, any> = {};

	// Get the resourceMapper data
	const columnsUi = context.getNodeParameter('columnsUi', itemIndex, {}) as any;

	// The resourceMapper returns data in the format: { value: { columnId: value } }
	if (columnsUi && columnsUi.value) {
		const mappedData = columnsUi.value;

		// Simply return the mapped data as-is
		// The resourceMapper already provides the column ID -> value mapping
		Object.assign(columnValues, mappedData);
	}

	return columnValues;
}
