/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { Job } from '../../model/Job';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { JobProperty } from '../../model/JobProperty';
import { ExecPlan } from '../../model/ExecPlan';
import { JobService } from '.';
import { ExecPlanTypes } from '../../model/ExecPlanTypes';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../model/ContextType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { MacroAction } from '../../model/MacroAction';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { JobTypes } from '../../model/JobTypes';
import { AbstractJobFormManager } from './AbstractJobFormManager';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../base-components/webapp/core/FormValuesChangedEventData';
import { MacroFieldCreator } from './MacroFieldCreator';
import { MacroObjectCreator } from './MacroObjectCreator';

export class JobFormService extends KIXObjectFormService {

    private static INSTANCE: JobFormService = null;

    public static getInstance(): JobFormService {
        if (!JobFormService.INSTANCE) {
            JobFormService.INSTANCE = new JobFormService();
        }

        return JobFormService.INSTANCE;
    }

    private constructor() {
        super();

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, {
            eventSubscriberId: 'JobFormService',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                const form = data.formInstance.getForm();
                if (form.objectType === KIXObjectType.JOB) {
                    const typeValue = data.changedValues.find((cv) => cv[0] && cv[0].property === JobProperty.TYPE);
                    if (typeValue) {
                        await data.formInstance.removePages(null, [data.formInstance.getForm().pages[0].id]);

                        if (typeValue[1] && typeValue[1].value) {
                            const manager: AbstractJobFormManager = this.getJobFormManager(typeValue[1].value);
                            if (manager) {
                                if (data.formInstance.getForm().formContext === FormContext.NEW) {
                                    manager.reset();
                                }

                                const context = ContextService.getInstance().getActiveContext();
                                const job = await context.getObject<Job>();
                                const pages = await manager.getPages(job, data.formInstance);
                                pages.forEach((p) => data.formInstance.addPage(p));
                            }
                        }
                    }
                }
            }
        });
    }

    private jobFormManager: Map<JobTypes | string, AbstractJobFormManager> = new Map();

    public getJobFormManager(type: JobTypes | string): AbstractJobFormManager {
        return this.jobFormManager.get(type);
    }

    public registerJobFormManager(type: JobTypes | string, manager: AbstractJobFormManager): void {
        this.jobFormManager.set(type, manager);
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.JOB;
    }

    protected async prePrepareForm(form: FormConfiguration, job: Job, formInstance: FormInstance): Promise<void> {
        form.pages = [];
        form.pages.push(AbstractJobFormManager.getJobPage(formInstance));

        if (form.pages.length && job && form.formContext === FormContext.EDIT) {
            const manager = this.getJobFormManager(job.Type);
            manager.job = job;

            const execPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
            if (execPlans && !!execPlans.length) {
                const eventExecPlans = execPlans.filter((ep) => ep.Type === ExecPlanTypes.EVENT_BASED);
                if (eventExecPlans && !!eventExecPlans.length) {
                    const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                    if (context) {
                        context.setAdditionalInformation(
                            JobProperty.EXEC_PLAN_EVENTS, eventExecPlans[0].Parameters.Event
                        );
                    }
                }
            }

            const pages = await manager.getPages(job, formInstance);
            form.pages = [...form.pages, ...pages];
        }
    }

    protected async getValue(
        property: string, value: any, job: Job, formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (job) {
            const manager = this.getJobFormManager(job.Type);
            value = manager.getValue(property, formField, value, job, formContext);
        }
        return value;
    }

    public async getNewFormField(
        f: FormFieldConfiguration, parent?: FormFieldConfiguration
    ): Promise<FormFieldConfiguration> {
        if (f.property === JobProperty.MACRO_ACTIONS) {
            return await MacroFieldCreator.createActionField(f.parent, null);
        }

        return super.getNewFormField(f, parent);
    }

    public async prepareCreateValue(
        property: string, formfield: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {

        if (property === JobProperty.MACROS) {
            if (!formfield.parentInstanceId) {
                value = await MacroObjectCreator.createMacro(formfield, formInstance);
            } else {
                value = null;
            }
        }

        return [[property, value]];
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        parameter = parameter.filter((p) => !p[0].startsWith('###MACRO###'));
        parameter = parameter.filter((p) => p[0] !== JobProperty.MACROS || p[1] !== null);
        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

    public async getFormFieldsForAction(
        actionType: string, actionFieldInstanceId: string, type: string, formInstance: FormInstance,
        action?: MacroAction
    ): Promise<FormFieldConfiguration[]> {
        let formFields = [];
        if (type) {
            const manager = this.getJobFormManager(type);
            formFields = await MacroFieldCreator.createActionOptionFields(
                actionType, actionFieldInstanceId, type, formInstance, manager, action
            );
        }
        return formFields;
    }

    public async updateFields(fields: FormFieldConfiguration[], formInstance: FormInstance): Promise<void> {
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;
        const manager = this.getJobFormManager(type);

        if (manager) {
            manager.updateFields(fields);
        }
    }

}
