/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "./ObjectFactory";
import { KIXObjectType } from "../../model";
import { ExecPlan } from "../../model/kix/exec-plan";

export class ExecPlanFactory extends ObjectFactory<ExecPlan> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.EXEC_PLAN;
    }

    public async create(execPlan?: ExecPlan): Promise<ExecPlan> {
        return new ExecPlan(execPlan);
    }

}