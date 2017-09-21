import { IRouter } from '@kix/core';
import { container } from './Container';
import { Application, Router, Request, Response } from 'express';

export class ServerRouter {

    private expressRouter: Router;

    public constructor(application: Application) {
        this.expressRouter = Router();

        application.use(this.expressRouter);

        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const registeredRouter = container.getDIContainer().getAll<IRouter>("IRouter");
        for (const router of registeredRouter) {
            // TODO: require app and base template and provide it to the registered router
            this.expressRouter.use(router.getBaseRoute(), router.getRouter());

            router.setAppTemplate(require('./components/app/index.marko'));
            router.setBaseTemplate(require('./components/kix-base-template/index.marko'));
        }
    }
}
