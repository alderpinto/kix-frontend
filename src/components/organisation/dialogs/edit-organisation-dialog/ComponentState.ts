import { AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public loading: boolean = false,
        public formId: string = 'edit-organisation-form'
    ) {
        super();
    }

}
