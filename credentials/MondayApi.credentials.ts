import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MondayApi implements ICredentialType {
	name = 'mondayApi';
	displayName = 'Monday.com API';
	documentationUrl = 'https://developer.monday.com/api-reference/docs/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'Your Monday.com API token. Get it from: Admin > API > Personal API Token',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'options',
			default: '2024-01',
			description: 'Monday.com API version to use. Versions are maintained for 2 years from release. See: https://developer.monday.com/api-reference/docs/api-versioning',
			options: [
				{
					name: '2023-10 (Deprecated Soon)',
					value: '2023-10',
					description: 'Legacy version - will be deprecated in Oct 2025',
				},
				{
					name: '2024-01 (Stable)',
					value: '2024-01',
					description: 'Includes formula columns support',
				},
				{
					name: '2024-04 (Stable)',
					value: '2024-04',
					description: 'Enhanced formula and automation features',
				},
				{
					name: '2024-07 (Stable)',
					value: '2024-07',
					description: 'Additional API improvements',
				},
				{
					name: '2024-10 (Stable)',
					value: '2024-10',
					description: 'Latest stable release',
				},
				{
					name: '2025-01 (Stable)',
					value: '2025-01',
					description: 'Enhanced docs and blocks support',
				},
				{
					name: '2025-07 (Future)',
					value: '2025-07',
					description: 'Future version placeholder',
				},
				{
					name: '2025-10 (Latest)',
					value: '2025-10',
					description: 'Current latest version with all features',
				},
			],
		},
		{
			displayName: 'Auto-Upgrade API Version',
			name: 'autoUpgrade',
			type: 'boolean',
			default: true,
			description:
				'Whether to automatically upgrade API version when using features that require a newer version',
		},
	];
}
