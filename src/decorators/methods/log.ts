import { container } from '../../Container';
import { ILoggingService } from '../../services/';

function log(target: any, propertyName: string, descriptor: any): MethodDecorator {
    const orgMethod = descriptor.value;
    // TODO: replace container.get with @inject within a constructor
    const loggingService = container.get<ILoggingService>("ILoggingService");
    descriptor.value = function () {
        loggingService.info(target.constructor.name + ' => ' + propertyName, arguments);
        return orgMethod.apply(this, arguments);
    };
    return descriptor;
}
export { log };
