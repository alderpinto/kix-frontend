import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ComponentsService, IColumn, ValueState } from '../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    private column: IColumn;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;

        if (input.column) {
            this.column = input.column;
            const componentId = (this.column as IColumn).getColumnConfiguration().componentId;
            this.state.showDefaultCell = !componentId || componentId === '';
        }

        if (this.state.cell) {
            const table = this.state.cell.getRow().getTable();
            const tableConfiguration = table.getTableConfiguration();
            this.state.object = this.state.cell.getRow().getRowObject().getObject();
            if (tableConfiguration) {
                this.state.routingConfiguration = tableConfiguration.routingConfiguration;
                if (this.state.routingConfiguration && this.state.object) {
                    this.state.objectId = this.state.object[this.state.routingConfiguration.objectIdProperty];
                }
            }

            switch (this.state.cell.getValue().state) {
                case ValueState.CHANGED:
                    this.state.stateClass = 'cell-value-changed';
                    break;
                case ValueState.DELETED:
                    this.state.stateClass = 'cell-value-deleted';
                    break;
                case ValueState.NEW:
                    this.state.stateClass = 'cell-value-new';
                    break;
                case ValueState.NOT_EXISTING:
                    this.state.stateClass = 'cell-value-not-existing';
                    break;
                case ValueState.HIGHLIGHT_ERROR:
                    this.state.stateClass = 'cell-value-highlight_error';
                    break;
                case ValueState.HIGHLIGHT_SUCCESS:
                    this.state.stateClass = 'cell-value-highlight_success';
                    break;
                default:
            }
        }
    }

    public getCellTemplate(): any {
        if (this.column) {
            return ComponentsService.getInstance().getComponentTemplate(
                this.column.getColumnConfiguration().componentId
            );
        }
        return undefined;
    }
}

module.exports = Component;
