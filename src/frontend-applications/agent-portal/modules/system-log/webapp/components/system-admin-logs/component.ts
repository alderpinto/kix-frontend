/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LogFile } from '../../../model/LogFile';
import { LogFileProperty } from '../../../model/LogFileProperty';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { LogFileTableFactory } from '../../core/table/LogFileTableFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.subscriber = {
            eventSubscriberId: 'logs-table-listener',
            eventPublished: (data: TableEventData, eventId: string, subscriberId?: string): void => {
                if (data?.tableId === LogFileTableFactory.TABLE_ID && eventId === TableEvent.ROW_CLICKED) {
                    const row = data?.table?.getRow(data.rowId);
                    const logFile = row?.getRowObject()?.getObject();
                    if (logFile instanceof LogFile) {
                        this.downloadLogFile(logFile);
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_CLICKED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_CLICKED, this.subscriber);
    }

    private async downloadLogFile(logFile: LogFile): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = [LogFileProperty.CONTENT];
        loadingOptions.query = [['tier', logFile.tier]];

        const files = await KIXObjectService.loadObjects<LogFile>(
            KIXObjectType.LOG_FILE, [logFile.ID], loadingOptions, null, false, false
        );

        if (files && files.length) {
            BrowserUtil.startBrowserDownload(files[0].Filename, files[0].Content, 'text/plain');
        }
    }

}

module.exports = Component;
