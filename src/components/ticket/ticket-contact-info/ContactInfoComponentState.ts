import { ContextType, Contact } from "@kix/core/dist/model";
import { ContactLabelProvider } from "@kix/core/dist/browser/contact";

export class ContactInfoComponentState {

    public constructor(
        public contextType: ContextType = null,
        public contact: Contact = null,
        public labelProvider: ContactLabelProvider = new ContactLabelProvider()
    ) { }

}
