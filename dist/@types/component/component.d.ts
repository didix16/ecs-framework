export interface IComponent {
    [key: string]: any;
}
export declare class Component implements IComponent {
    constructor(data: IComponent);
    toString(): string;
}
