export interface Project {
    id: string;
    name: string;
    amount: number;
}

export interface DayData {
    tradingFee: number;
    alphaAirdrops: Project[];
    alphaEvents: Project[];
    points: number;
}
