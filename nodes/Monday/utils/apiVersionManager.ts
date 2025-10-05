import { MondayApiVersionConfig } from '../types/Monday.types';

/**
 * API Version Manager for Monday.com
 * Handles dynamic API versioning and auto-detection
 */
export class ApiVersionManager {
	static readonly API_VERSIONS: Record<string, MondayApiVersionConfig> = {
		'2023-10': {
			version: '2023-10',
			autoDetect: false,
			features: ['basic', 'items', 'boards', 'updates'],
		},
		'2024-01': {
			version: '2024-01',
			autoDetect: true,
			features: ['basic', 'items', 'boards', 'updates', 'formula_read'],
		},
		'2024-04': {
			version: '2024-04',
			autoDetect: true,
			features: ['basic', 'items', 'boards', 'updates', 'formula_read', 'formula_write'],
		},
		'2025-07': {
			version: '2025-07',
			autoDetect: true,
			features: [
				'basic',
				'items',
				'boards',
				'updates',
				'formula_read',
				'formula_write',
				'advanced_permissions',
			],
		},
	};

	/**
	 * Get required API version for an operation or column type
	 */
	static getRequiredVersion(operation?: string, columnType?: string): string {
		const requirements: Record<string, string> = {
			readFormula: '2024-01',
			writeFormula: '2024-04',
			formula: '2024-01', // column type
			advancedPermissions: '2025-07',
		};

		if (operation && requirements[operation]) {
			return requirements[operation];
		}

		if (columnType && requirements[columnType]) {
			return requirements[columnType];
		}

		return '2023-10'; // default
	}

	/**
	 * Validate and upgrade API version if needed
	 */
	static async validateAndUpgrade(
		requestedVersion: string,
		operation?: string,
		columnType?: string,
		autoUpgrade: boolean = true,
	): Promise<{ version: string; upgraded: boolean; warning?: string }> {
		const requiredVersion = this.getRequiredVersion(operation, columnType);

		// If requested version is sufficient
		if (this.compareVersions(requestedVersion, requiredVersion) >= 0) {
			return { version: requestedVersion, upgraded: false };
		}

		// If auto-upgrade is enabled
		if (autoUpgrade) {
			const warningMessage = operation
				? `Auto-upgraded API version from ${requestedVersion} to ${requiredVersion} for operation '${operation}'`
				: `Auto-upgraded API version from ${requestedVersion} to ${requiredVersion}`;

			return {
				version: requiredVersion,
				upgraded: true,
				warning: warningMessage,
			};
		}

		// Otherwise throw error
		throw new Error(
			`Operation '${operation}' requires API version ${requiredVersion} or higher. ` +
				`Current version: ${requestedVersion}. Please update the API Version setting.`,
		);
	}

	/**
	 * Compare two versions
	 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
	 */
	static compareVersions(v1: string, v2: string): number {
		const [year1, month1] = v1.split('-').map(Number);
		const [year2, month2] = v2.split('-').map(Number);

		if (year1 !== year2) return year1 > year2 ? 1 : -1;
		if (month1 !== month2) return month1 > month2 ? 1 : -1;
		return 0;
	}

	/**
	 * Check if a feature is available in a version
	 */
	static hasFeature(version: string, feature: string): boolean {
		const versionConfig = this.API_VERSIONS[version];
		if (!versionConfig) return false;
		return versionConfig.features.includes(feature);
	}

	/**
	 * Get the latest available version
	 */
	static getLatestVersion(): string {
		const versions = Object.keys(this.API_VERSIONS);
		return versions.sort((a, b) => this.compareVersions(b, a))[0];
	}

	/**
	 * Get all available versions
	 */
	static getAvailableVersions(): string[] {
		return Object.keys(this.API_VERSIONS);
	}
}
