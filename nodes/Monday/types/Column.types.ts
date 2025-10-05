export type MondayColumnType =
	| 'status'
	| 'dropdown'
	| 'people'
	| 'date'
	| 'timeline'
	| 'numbers'
	| 'text'
	| 'long_text'
	| 'link'
	| 'email'
	| 'phone'
	| 'rating'
	| 'checkbox'
	| 'board_relation'
	| 'dependency'
	| 'tags'
	| 'hour'
	| 'week'
	| 'color_picker'
	| 'file'
	| 'formula';

export interface ColumnValueFormat {
	[key: string]: any;
}

export interface StatusColumnValue {
	label: string;
	index?: number;
}

export interface DropdownColumnValue {
	labels: string[];
}

export interface PeopleColumnValue {
	personsAndTeams: Array<{
		id: string;
		kind: 'person' | 'team';
	}>;
}

export interface DateColumnValue {
	date: string;
	time?: string;
}

export interface TimelineColumnValue {
	from: string;
	to: string;
}

export interface LinkColumnValue {
	url: string;
	text: string;
}

export interface EmailColumnValue {
	email: string;
	text: string;
}

export interface RatingColumnValue {
	rating: number;
}

export interface CheckboxColumnValue {
	checked: boolean;
}

export interface BoardRelationColumnValue {
	linkedPulseIds: Array<{
		linkedPulseId: number;
	}>;
}

export interface TagsColumnValue {
	tag_ids: number[];
}

export interface HourColumnValue {
	hour: number;
	minute: number;
}

export interface ColorPickerColumnValue {
	color: string;
}

export interface LongTextColumnValue {
	text: string;
}
