import { KIXObjectType, KIXObject } from "../../model";
import { ITableCSSHandler } from "./ITableCSSHandler";

export class TableCSSHandlerRegistry {

    private static INSTANCE: TableCSSHandlerRegistry;

    public static getInstance(): TableCSSHandlerRegistry {
        if (!TableCSSHandlerRegistry.INSTANCE) {
            TableCSSHandlerRegistry.INSTANCE = new TableCSSHandlerRegistry();
        }
        return TableCSSHandlerRegistry.INSTANCE;
    }

    private constructor() { }

    private handler: Map<KIXObjectType, ITableCSSHandler<any>> = new Map();

    public registerCSSHandler<T>(objectType: KIXObjectType, handler: ITableCSSHandler<T>): void {
        if (!this.handler.has(objectType)) {
            this.handler.set(objectType, handler);
        }
    }

    public static getCSSHandler<T>(objectType: KIXObjectType): ITableCSSHandler<T> {
        return TableCSSHandlerRegistry.getInstance().handler.get(objectType);
    }

}
