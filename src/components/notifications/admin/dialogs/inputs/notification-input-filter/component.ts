import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../../core/model';

class Component extends FormInputComponent<Array<[string, string[] | number[]]>, ComponentState> {

    private listenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.listenerId = 'notification-input-filter-manager-listener';
        await super.onMount();
        this.state.manager.registerListener(this.listenerId, () => {
            const filterValues: Array<[string, string[] | number[]]> = [];
            const values = this.state.manager.getValues();
            values.forEach((v) => {
                if (v.value !== null) {
                    filterValues.push([v.property, v.value]);
                }
            });
            super.provideValue(filterValues);
        });
    }

    public async onDestroy(): Promise<void> {
        if (this.state.manager) {
            this.state.manager.unregisterListener(this.listenerId);
        }
    }

}

module.exports = Component;
