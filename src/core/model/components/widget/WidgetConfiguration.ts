import { WidgetSize } from './WidgetSize';
import { KIXObjectPropertyFilter } from '../filter';
import { ObjectIcon } from '../../kix';

export class WidgetConfiguration<T = any> {

    public constructor(
        public widgetId: string,
        public title: string,
        public actions: string[],
        public settings: T,
        public minimized: boolean = false,
        public minimizable: boolean = true,
        public icon: string | ObjectIcon = '',
        public contextDependent: boolean = false
    ) { }

}
