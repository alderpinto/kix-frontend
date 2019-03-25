import { FormInputComponentState } from "../../../../../../core/model";
import { CheckboxOption } from "./CheckboxOption";

export class ComponentState extends FormInputComponentState<any> {

    public constructor(
        public checkboxOptions: CheckboxOption[] = [],
        public titles: Map<string, string> = new Map()
    ) {
        super();
    }

}
