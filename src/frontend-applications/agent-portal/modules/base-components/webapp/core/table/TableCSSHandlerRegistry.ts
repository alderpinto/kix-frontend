/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableCSSHandler } from "./ITableCSSHandler";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";

export class TableCSSHandlerRegistry {

    private static INSTANCE: TableCSSHandlerRegistry;

    public static getInstance(): TableCSSHandlerRegistry {
        if (!TableCSSHandlerRegistry.INSTANCE) {
            TableCSSHandlerRegistry.INSTANCE = new TableCSSHandlerRegistry();
        }
        return TableCSSHandlerRegistry.INSTANCE;
    }

    private constructor() { }

    private commonHandler: ITableCSSHandler[] = [];
    private objectHandler: Map<KIXObjectType | string, ITableCSSHandler<any>> = new Map();

    public registerCommonCSSHandler(handler: ITableCSSHandler): void {
        this.commonHandler.push(handler);
    }

    public registerObjectCSSHandler<T>(objectType: KIXObjectType | string, handler: ITableCSSHandler<T>): void {
        if (!this.objectHandler.has(objectType)) {
            this.objectHandler.set(objectType, handler);
        }
    }

    public static getCommonCSSHandler(): ITableCSSHandler[] {
        return TableCSSHandlerRegistry.getInstance().commonHandler;
    }

    public static getObjectCSSHandler<T>(objectType: KIXObjectType | string): ITableCSSHandler<T> {
        return TableCSSHandlerRegistry.getInstance().objectHandler.get(objectType);
    }

}
