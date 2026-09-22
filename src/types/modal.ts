import type { INewGameParams } from './game';

export interface ICreateGameModalProps {
	error?			: string;
	onClose			: () => void;
	onCreate		: ( params: INewGameParams ) => void;
}
