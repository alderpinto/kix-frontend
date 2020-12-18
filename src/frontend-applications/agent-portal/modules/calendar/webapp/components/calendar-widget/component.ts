/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../../ticket/model/Ticket';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { AgentService } from '../../../../user/webapp/core';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { CalendarConfiguration } from '../../core/CalendarConfiguration';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ContextType } from '../../../../../model/ContextType';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { Contact } from '../../../../customer/model/Contact';
import { ContactProperty } from '../../../../customer/model/ContactProperty';

declare const tui: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private calendar: any;
    private calendarConfig: CalendarConfiguration;
    private contextListenerId: string;
    private widgetConfiguration: WidgetConfiguration;
    private creatingCalendar: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);
            if (this.widgetConfiguration && this.widgetConfiguration.configuration) {
                this.calendarConfig = (this.widgetConfiguration.configuration as CalendarConfiguration);
                this.initWidget();

                if (this.widgetConfiguration.contextDependent) {
                    this.contextListenerId = 'calendar widget' + this.widgetConfiguration.instanceId;
                    context.registerListener(this.contextListenerId, {
                        additionalInformationChanged: () => null,
                        explorerBarToggled: () => null,
                        filteredObjectListChanged: () => {
                            this.state.prepared = false;
                            setTimeout(() => this.initWidget(), 50);
                        },
                        objectChanged: () => null,
                        objectListChanged: () => null,
                        scrollInformationChanged: () => null,
                        sidebarToggled: () => null
                    });
                }

            }
        }
    }

    public onDestroy(): void {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.unregisterListener(this.contextListenerId);
        }
    }

    private async initWidget(): Promise<void> {
        if (this.creatingCalendar) {
            return;
        }

        this.creatingCalendar = true;

        const user = await AgentService.getInstance().getCurrentUser();
        let tickets = [];

        if (this.widgetConfiguration.contextDependent) {
            const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
            tickets = context.getFilteredObjectList(KIXObjectType.TICKET);
        } else {
            const ticketFilter = [
                new FilterCriteria(
                    TicketProperty.OWNER_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND,
                    user.UserID
                ),
                new FilterCriteria(
                    TicketProperty.STATE_TYPE, SearchOperator.NOT_EQUALS, FilterDataType.STRING, FilterType.AND,
                    ['closed']
                )
            ];

            tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, null, new KIXObjectLoadingOptions(
                    ticketFilter, null, null, [TicketProperty.STATE_TYPE, KIXObjectProperty.DYNAMIC_FIELDS]
                )
            );
        }

        this.state.prepared = true;

        setTimeout(async () => {
            await this.createCalendar(tickets);
            this.creatingCalendar = false;
        }, 50);
    }

    private async createCalendar(tickets: Ticket[]): Promise<void> {
        const userIds: Map<number, string> = new Map();
        for (const t of tickets) {
            if (!userIds.has(t.OwnerID)) {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, null,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            ContactProperty.ASSIGNED_USER_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.AND, t.OwnerID
                        )
                    ])
                );

                const fullName = Array.isArray(contacts) && contacts.length
                    ? contacts[0].Fullname
                    : t.OwnerID.toString();

                userIds.set(t.OwnerID, fullName);
            }
        }

        const calendars = [];
        userIds.forEach((fullName: string, uid: number) => {
            const bgColor = BrowserUtil.getUserColor(uid);
            calendars.push({
                id: uid,
                name: fullName,
                color: '#ffffff',
                bgColor,
                borderColor: bgColor,
                visible: true
            });
        });

        this.state.calendars = calendars;

        this.calendar = new tui.Calendar('#calendar', {
            defaultView: 'month',
            useDetailPopup: true,
            taskView: [],
            calendars,
            month: {
                moreLayerSize: {
                    height: 'auto'
                },
                narrowWeekend: true,
                startDayOfWeek: 1, // monday
                visibleScheduleCount: 10,
            },
            week: {
                moreLayerSize: {
                    height: 'auto'
                },
                narrowWeekend: true,
                startDayOfWeek: 1, // monday
                visibleScheduleCount: 10,
                hourStart: 7,
                hourEnd: 18
            }
        });

        this.state.loading = true;
        const schedules = await this.createSchedules(tickets);
        this.calendar.createSchedules(schedules);
        this.state.loading = false;

        this.setCurrentDate();

        this.calendar.on('beforeUpdateSchedule', this.scheduleChanged.bind(this));
        this.calendar.on('clickSchedule', this.scheduleClicked.bind(this));
        this.calendar.on('beforeCreateSchedule', (event) => {
            const guide = event.guide;
            guide.clearGuideElement();
        });
    }

    private async createSchedules(tickets: Ticket[]): Promise<any[]> {
        const schedules = [];

        const ticketsWithDF = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, tickets.map((t) => t.TicketID),
            new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
        );

        if (Array.isArray(ticketsWithDF) && ticketsWithDF.length) {
            tickets = ticketsWithDF;
        }

        for (const ticket of tickets) {
            const title = await LabelService.getInstance().getObjectText(ticket, true);
            const isPending = ticket.StateType === 'pending reminder';
            const bgColor = BrowserUtil.getUserColor(ticket.OwnerID);
            const schedule: any = {
                id: ticket.TicketID,
                calendarId: ticket.OwnerID,
                title,
                category: 'time',
                raw: ticket,
                borderColor: bgColor,
            };

            if (isPending) {
                const pendingSchedule = { ...schedule };
                pendingSchedule.calendarId = 'pending';

                const pendingDate = new Date(ticket.PendingTime);
                pendingSchedule.start = pendingDate;
                const endDate = new Date(pendingDate);
                endDate.setHours(endDate.getHours() + 1);

                pendingSchedule.end = pendingDate;
                schedules.push(pendingSchedule);
            }

            if (await this.setScheduleDates(ticket, schedule)) {
                schedules.push(schedule);
            }
        }

        return schedules;
    }

    private async setScheduleDates(ticket: Ticket, schedule: any): Promise<boolean> {
        const planStart = ticket.DynamicFields.find((df) => df.Name === this.calendarConfig.startDateProperty);
        const planEnd = ticket.DynamicFields.find((df) => df.Name === this.calendarConfig.endDateProperty);

        const hasStart = planStart && planStart.Value && Array.isArray(planStart.Value) && planStart.Value.length;
        const hasEnd = planEnd && planEnd.Value && Array.isArray(planEnd.Value) && planEnd.Value.length;

        const startValue = hasStart ? new Date(planStart.Value[0]) : new Date();
        const endValue = hasEnd ? new Date(planEnd.Value[0]) : new Date();

        let isSchedule = false;

        if (!hasStart && !hasEnd) {
            isSchedule = false;
        } else if (hasStart && hasEnd) {
            schedule.start = startValue;
            schedule.end = endValue;
            isSchedule = true;
        } else if (((hasStart && !hasEnd) || (!hasStart && hasEnd))) {
            schedule.isAllDay = true;
            schedule.start = hasStart ? startValue : endValue;
            schedule.end = hasEnd ? endValue : startValue;
            isSchedule = true;
        }

        return isSchedule;
    }

    private async scheduleChanged(event) {
        const schedule = event.schedule;
        const changes = event.changes;

        if (changes) {
            const parameter = [];

            const today = new Date();

            if (schedule.raw.StateType === 'pending reminder' && schedule.calendarId === 'pending') {
                if (changes.start) {
                    if (today > changes.start.toDate()) {
                        BrowserUtil.openErrorOverlay('Translatable#Pending date is not in the future.');
                    } else {
                        const pendingDate = DateTimeUtil.getKIXDateTimeString(changes.start.toDate());
                        parameter.push([TicketProperty.STATE_ID, schedule.raw.StateID]);
                        parameter.push([TicketProperty.PENDING_TIME, pendingDate]);
                    }
                } else if (changes.end) {
                    const newStart = schedule.end.toDate();
                    newStart.setHours(changes.end.toDate().getHours() - 1);
                    const pendingDate = DateTimeUtil.getKIXDateTimeString(newStart);
                    parameter.push([TicketProperty.STATE_ID, schedule.raw.StateID]);
                    parameter.push([TicketProperty.PENDING_TIME, pendingDate]);

                    changes.start = newStart;
                }
            } else {
                const dfValue = [];
                if (changes.start) {
                    const startDate = DateTimeUtil.getKIXDateTimeString(changes.start.toDate());
                    dfValue.push({ Name: this.calendarConfig.startDateProperty, Value: startDate });
                }

                if (changes.end) {
                    const endDate = DateTimeUtil.getKIXDateTimeString(changes.end.toDate());
                    dfValue.push({ Name: this.calendarConfig.endDateProperty, Value: endDate });
                }

                if (dfValue.length) {
                    parameter.push([KIXObjectProperty.DYNAMIC_FIELDS, dfValue]);
                }
            }

            if (parameter.length) {
                KIXObjectService.updateObject(KIXObjectType.TICKET, parameter, schedule.id)
                    .then(() => {
                        this.calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
                        if (this.widgetConfiguration.contextDependent) {
                            const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                            if (context) {
                                context.reloadObjectList(KIXObjectType.TICKET, true);
                            }
                        }
                    })
                    .catch(() => null);
            }
        }
    }

    public changeView(): void {
        this.state.view = this.state.view === 'month' ? 'week' : 'month';
        this.state.viewLabel = this.state.view === 'month' ? 'Translatable#Week' : 'Translatable#Month';
        this.setCurrentDate();
        this.calendar.changeView(this.state.view, true);
    }

    public today(): void {
        if (this.calendar) {
            this.calendar.setDate(new Date());
            this.calendar.changeView(this.state.view, true);
            this.setCurrentDate();
        }
    }

    public next(): void {
        if (this.calendar) {
            this.calendar.next();
            this.setCurrentDate();
        }
    }

    public prev(): void {
        if (this.calendar) {
            this.calendar.prev();
            this.setCurrentDate();
        }
    }

    private async scheduleClicked(event: any): Promise<void> {
        const schedule = event.schedule;
        if (schedule) {
            const template = KIXModulesService.getComponentTemplate('calendar-schedule-details');

            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [schedule.raw.TicketID]
            );

            if (tickets && tickets.length) {
                const content = template.renderSync({ ticket: tickets[0], calendarConfig: this.calendarConfig });

                setTimeout(() => {
                    const items = document.getElementsByClassName('tui-full-calendar-popup-container');
                    if (items && items.length) {
                        items.item(0).innerHTML = '';
                        content.appendTo(items.item(0));
                    }
                }, 5);
            }
        }
    }

    private async setCurrentDate(): Promise<void> {
        const currentDate = this.calendar.getDate().toDate();
        const month = currentDate.getMonth();

        const monthLabel = await DateTimeUtil.getMonthName(currentDate);

        const weekLabel = await TranslationService.translate('Translatable#CW');
        let calendarWeekLabel = weekLabel;

        if (this.state.view === 'month') {
            const firstDayOfMonth = new Date(currentDate.getFullYear(), month, 1);
            const week1 = DateTimeUtil.getWeek(firstDayOfMonth);

            const lastDayOfMonth = new Date(currentDate.getFullYear(), month + 1, 0);
            const week2 = DateTimeUtil.getWeek(lastDayOfMonth);
            calendarWeekLabel += ` ${week1}-${week2}`;
        } else {
            const week = DateTimeUtil.getWeek(currentDate);
            calendarWeekLabel += ` ${week}`;
        }

        this.state.currentDate = `${monthLabel} ${currentDate.getFullYear()} | ${calendarWeekLabel}`;
    }

    public toggleCalendar(calendar: any): void {
        const cal = this.state.calendars.find((c) => c.id === calendar.id);
        cal.visible = !cal.visible;
        (this as any).setStateDirty('calendars');
        this.calendar.toggleSchedules(cal.id, !cal.visible);
    }

}

module.exports = Component;
