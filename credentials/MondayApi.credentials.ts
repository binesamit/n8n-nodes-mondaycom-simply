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
			default: '2023-10',
			description: 'Monday.com API version to use. Some features require newer versions.',
			options: [
				{
					name: '2023-10 (Legacy - Current Default)',
					value: '2023-10',
					description: 'Original version - compatible with existing workflows',
				},
				{
					name: '2024-01 (Formula Support)',
					value: '2024-01',
					description: 'Required for reading formula columns',
				},
				{
					name: '2024-04 (Formula Write)',
					value: '2024-04',
					description: 'Supports creating and updating formula columns',
				},
				{
					name: '2025-07 (Latest - Recommended)',
					value: '2025-07',
					description: 'Latest stable version with all features',
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
