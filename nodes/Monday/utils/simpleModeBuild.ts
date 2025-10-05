import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Build column values from Simple Mode UI fields
 */
export function buildColumnValuesFromSimpleMode(
	context: IExecuteFunctions,
	itemIndex: number,
): Record<string, any> {
	const columnValues: Record<string, any> = {};

	// Status column
	const statusColumn = context.getNodeParameter('statusColumn', itemIndex, '') as string;
	if (statusColumn) {
		const statusValue = context.getNodeParameter('statusValue', itemIndex, '') as string;
		if (statusValue) {
			columnValues[statusColumn] = { label: statusValue };
		}
	}

	// Dropdown column
	const dropdownColumn = context.getNodeParameter('dropdownColumn', itemIndex, '') as string;
	if (dropdownColumn) {
		const dropdownValues = context.getNodeParameter('dropdownValues', itemIndex, []) as string[];
		if (dropdownValues.length > 0) {
			columnValues[dropdownColumn] = { labels: dropdownValues };
		}
	}

	// People column
	const peopleColumn = context.getNodeParameter('peopleColumn', itemIndex, '') as string;
	if (peopleColumn) {
		const peopleValues = context.getNodeParameter('peopleValues', itemIndex, []) as string[];
		if (peopleValues.length > 0) {
			columnValues[peopleColumn] = {
				personsAndTeams: peopleValues.map((id) => ({
					id,
					kind: id.startsWith('team_') ? 'team' : 'person',
				})),
			};
		}
	}

	// Board Relation column
	const boardRelationColumn = context.getNodeParameter(
		'boardRelationColumn',
		itemIndex,
		'',
	) as string;
	if (boardRelationColumn) {
		const boardRelationValues = context.getNodeParameter(
			'boardRelationValues',
			itemIndex,
			[],
		) as string[];
		if (boardRelationValues.length > 0) {
			columnValues[boardRelationColumn] = {
				linkedPulseIds: boardRelationValues.map((id) => ({ linkedPulseId: parseInt(id, 10) })),
			};
		}
	}

	// Timeline column
	const timelineColumn = context.getNodeParameter('timelineColumn', itemIndex, '') as string;
	if (timelineColumn) {
		const startDate = context.getNodeParameter('timelineStartDate', itemIndex, '') as string;
		const endDate = context.getNodeParameter('timelineEndDate', itemIndex, '') as string;
		if (startDate && endDate) {
			columnValues[timelineColumn] = {
				from: startDate,
				to: endDate,
			};
		}
	}

	return columnValues;
}
