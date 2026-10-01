export interface ICardboard {
	id			: number;
	matrix		: ( number | null )[][];
	numbers		: number[];
}

export interface ICardboardProps {
	cardboard		: ICardboard;
	drawn			: number[];
	currentNumber	: number | null;
}

export type TSortOrder = 'original' | 'asc' | 'desc';

export interface IHistoryProps {
	drawn				: number[];
	currentNumber		: number | null;
	gameId				: string;
	start				: number;
	end					: number;
	cardboardsCount?	: number;
}
