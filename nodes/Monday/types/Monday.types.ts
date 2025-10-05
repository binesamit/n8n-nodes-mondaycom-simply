export interface BoardMetadata {
	id: string;
	name: string;
	columns: ColumnDefinition[];
	items?: Item[];
}

export interface ColumnDefinition {
	id: string;
	title: string;
	type: string;
	settings_str: string;
}

export interface Item {
	id: string;
	name: string;
	column_values?: ColumnValue[];
	[key: string]: any; // Index signature for n8n compatibility
}

export interface ColumnValue {
	id: string;
	title?: string;
	type?: string;
	text?: string;
	value?: string;
}

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

export interface CacheStructure {
	boards: {
		[boardId: string]: {
			metadata: BoardMetadata;
			columns: ColumnDefinition[];
			lastFetched: number;
			ttl: number;
		};
	};
	items: {
		[boardId: string]: {
			items: Item[];
			lastFetched: number;
			ttl: number;
		};
	};
}

export enum ColumnInputMode {
	ADVANCED = 'advanced',
	SIMPLE = 'simple',
}

export interface MondayApiVersionConfig {
	version: string;
	autoDetect: boolean;
	features: string[];
}

export interface QueryCondition {
	column: string;
	operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
	value: any;
}

export interface QueryGroup {
	logic: 'AND' | 'OR';
	conditions: (QueryCondition | QueryGroup)[];
}

export interface ValidationRule {
	required?: boolean;
	type?: 'array' | 'string' | 'number' | 'object';
	minLength?: number;
	maxLength?: number;
	custom?: (value: any) => boolean;
}

export interface BoardRelationColumn {
	id: string;
	title: string;
	type: 'board_relation';
	settings: {
		board_ids: number[];
	};
}
