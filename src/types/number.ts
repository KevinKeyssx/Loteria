export interface INumberProps {
	value?			: number;
	min?			: number;
	max?			: number;
	step?			: number;
	disabled?		: boolean;
	id?				: string;
	name?			: string;
	placeholder?	: string;
	onchange?		: ( value: number ) => void;
}
