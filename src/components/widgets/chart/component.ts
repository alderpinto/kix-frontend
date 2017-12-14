import { ChartFactory } from '@kix/core/dist/browser/model/charts';
import { ChartComponentState } from './model/ChartComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class ChartWidgetComponent {

    private state: ChartComponentState;
    private componentInititalized: boolean = false;

    public onCreate(input: any): void {
        this.state = new ChartComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);

        this.drawChart();
    }

    public showConfigurationClicked(): void {
        ApplicationStore.getInstance().toggleDialog('chart-configuration');
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
        this.drawChart();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private drawChart(): void {
        setTimeout(() => {
            const element = document.getElementById(this.state.svgId);
            if (element && this.state.widgetConfiguration) {
                element.innerHTML = '';
                ChartFactory.createChart(this.state.svgId, this.state.widgetConfiguration.settings);
            }
        }, 1);
    }
}

module.exports = ChartWidgetComponent;
