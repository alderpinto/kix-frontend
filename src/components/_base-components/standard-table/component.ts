declare var PerfectScrollbar: any;
import { StandardTableComponentState } from './StandardTableComponentState';
import { StandardTableInput } from './StandardTableInput';
import { StandardTableConfiguration, StandardTableColumn } from '@kix/core/dist/browser';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

class StandardTableComponent<T> {

    private state: StandardTableComponentState;

    public onCreate(input: StandardTableInput): void {
        this.state = new StandardTableComponentState();
    }

    public onInput(input: StandardTableInput): void {
        this.state.tableConfiguration = input.tableConfiguration;
    }

    public onMount(): void {
        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));
        if (this.state.tableConfiguration) {
            this.state.tableConfiguration.contentProvider.addListener(() => {
                (this as any).forceUpdate();
            });
            const psY = new PerfectScrollbar('.standard-table', {
                minScrollbarLength: 50,
                wrapperElement: '.standard-table-wrapper'
            });
        }

        this.initTableScrollRange();
    }

    private initTableScrollRange(): void {
        setTimeout(() => {
            const table = (this as any).getEl('standard-table');
            const header = (this as any).getEl('header-row');
            const fixedLeftHeader = (this as any).getEl('fixed-left-header');
            const fixedRightHeader = (this as any).getEl('fixed-right-header');

            const fixedLeftColumns: any = document.querySelectorAll("[data-id='fixed-left-column']");
            const fixedRightColumns: any = document.querySelectorAll("[data-id='fixed-right-column']");
            const scrollbars: any = document.querySelectorAll("[data-id='scrollbar-column']");
            const subRows: any = document.querySelectorAll("[data-id='sub-row-wrapper']");

            if (table) {
                table.addEventListener('ps-scroll-y', () => {
                    header.style.top = table.scrollTop + 'px';
                });

                // linke, rechte Spalte und geöffnete Zeile fixieren
                table.addEventListener('ps-scroll-x', () => {
                    fixedLeftHeader.style.left = table.scrollLeft + 'px';
                    fixedLeftColumns.forEach((element: any) => {
                        element.style.left = table.scrollLeft + 'px';
                    });

                    fixedRightHeader.style.right = ((table.scrollLeft + 24) * -1) + 'px';
                    fixedRightColumns.forEach((element: any) => {
                        element.style.right = ((table.scrollLeft + 24) * -1) + 'px';
                    });

                    scrollbars.forEach((element: any) => {
                        element.style.right = (table.scrollLeft * -1) + 'px';
                    });

                    subRows.forEach((element: any) => {
                        element.style.left = table.scrollLeft + 'px';
                    });
                });
            }
        }, 500);
    }

    private getRows(): T[] {
        return this.state.tableConfiguration
            ? this.state.tableConfiguration.contentProvider.getRowObjects()
            : [];
    }

    private getColumnIds(): string[] {
        return this.state.tableConfiguration ? this.state.tableConfiguration.contentProvider.getColumnIds() : [];
    }

    private getColumnConfiguration(columnId: string): StandardTableColumn {
        return this.state.tableConfiguration.contentProvider.getColumn(columnId);
    }

    private getColumnTitle(columnId: string): string {
        return this.state.tableConfiguration
            ? this.state.tableConfiguration.labelProvider.getColumnTitle(columnId)
            : columnId;
    }

    private getColumnObjectValue(object: any, columnId: string): number | string {
        return this.state.tableConfiguration.labelProvider.getColumnObjectValue(object, columnId);
    }

    private getColumnDisplayText(rowObject: T, columnId: string): string {
        return this.state.tableConfiguration
            ? this.state.tableConfiguration.labelProvider.getColumnValue(rowObject, columnId)
            : columnId;
    }

    private mousedown(col: string, event: any): void {
        this.state.resizeSettings.resizeColumn = col;
        this.state.resizeSettings.startOffset = event.target.offsetWidth - event.pageX;
    }

    private mousemove(event: any): void {
        if (this.state.resizeSettings.resizeColumn) {
            const selector = "[data-id='" + this.state.resizeSettings.resizeColumn + "']";
            const elements: any = document.querySelectorAll(selector);
            elements.forEach((element: any) => {
                element.style.width = this.state.resizeSettings.startOffset + 150 + event.pageX + 'px';
            });
        }
    }

    private mouseup(): void {
        this.state.resizeSettings.resizeColumn = undefined;
    }

    private sortUp(columnId: string): void {
        this.state.tableConfiguration.contentProvider.sortObjects(SortOrder.UP, columnId);
    }

    private sortDown(columnId: string): void {
        this.state.tableConfiguration.contentProvider.sortObjects(SortOrder.DOWN, columnId);
    }


}

module.exports = StandardTableComponent;
