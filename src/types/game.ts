export interface IGame {
	id				: string;
	name			: string;
	start			: number;
	end				: number;
	canRepeat		: boolean;
	enableVoice		: boolean;
	drawn			: number[];
	createdAt		: string;
}

export interface INewGameParams {
	name			: string;
	start			: number;
	end				: number;
	canRepeat		: boolean;
	enableVoice		: boolean;
}

export interface IAdminPanelProps {
	games			: IGame[];
	onReset			: ( id: string ) => void;
	onDelete		: ( id: string ) => void;
	onClose			: () => void;
}

export interface INumberShuffleProps {
	start		: number;
	end			: number;
}

export interface IVoiceState {
	isReady			: boolean;
	isLoading		: boolean;
	progress		: number;
	statusText		: string;
	error			: string | null;
}

export interface IProgressCallbackData {
	status			: string;
	name?			: string;
	file?			: string;
	progress?		: number;
	loaded?			: number;
	total?			: number;
}

export interface ITTSResult {
	audio			: Float32Array;
	sampling_rate	: number;
}

export interface IStarParticle {
	id				: number;
	left			: number;
	top				: number;
	size			: number;
	delay			: number;
	duration		: number;
	color			: string;
	type			: 'star' | 'dot';
	glow			: string;
}
