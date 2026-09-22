export interface ISwitchProps {
	checked?		: boolean;
	disabled?		: boolean;
	id?				: string;
	name?			: string;
	label?			: string;
	onchange?		: ( checked: boolean ) => void;
}

export interface ISwitcherProps {
	title			: string;
	description?	: string;
	checked?		: boolean;
	disabled?		: boolean;
	id?				: string;
	name?			: string;
	onchange?		: ( checked: boolean ) => void;
}
