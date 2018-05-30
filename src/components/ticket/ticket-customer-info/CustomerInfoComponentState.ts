import { ContextType, Customer } from "@kix/core/dist/model";
import { CustomerLabelProvider } from "@kix/core/dist/browser/customer";

export class CustomerInfoComponentState {

    public constructor(
        public contextType: ContextType = null,
        public customer: Customer = null,
        public labelProvider: CustomerLabelProvider = new CustomerLabelProvider()
    ) { }

}
