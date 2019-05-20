import { AbstractMarkoComponent } from '../../../../core/browser';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.showToggle = typeof input.showToggle !== 'undefined' ? input.showToggle : true;
        if (this.state.showToggle) {
            this.state.toggled = typeof input.toggle !== 'undefined' ? input.toggle : false;
        } else {
            this.state.toggled = false;
        }
    }

    public labelClicked(event: any): void {
        if (this.state.showToggle) {
            this.state.toggled = !this.state.toggled;
        } else {
            this.state.toggled = false;
        }
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('labelClicked');
    }

    public removeLabel(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('removeLabel');
    }
}

module.exports = Component;
