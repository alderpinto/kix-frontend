import { ChartReduxState } from './ChartReduxState';
import { ChartAction } from './actions';
import { WidgetAction } from '@kix/core/dist/model/client';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ChartActionHandler {

    public handleLoginAction(state: ChartReduxState, action): ChartReduxState {
        switch (action.type) {

            case ChartAction.CHART_INITIALIZE + FULFILLED:
                return { ...state, socketListener: action.payload.socketListener };

            case WidgetAction.WIDGET_LOADED + FULFILLED:
                return { ...state, widgetConfiguration: action.payload.widgetConfiguration };

            default:
                return { ...state };
        }
    }
}

const chartActionHandler = new ChartActionHandler();

export default (state, action) => {
    state = state || new ChartReduxState();

    return chartActionHandler.handleLoginAction(state, action);
};
