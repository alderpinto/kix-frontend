import { KIXModulesSocketClient } from "./KIXModulesSocketClient";
import { IKIXModuleExtension } from "../../extensions";
import { ComponentsService } from "../components";

export class KIXModulesService {

    private static INSTANCE: KIXModulesService;

    public static getInstance(): KIXModulesService {
        if (!KIXModulesService.INSTANCE) {
            KIXModulesService.INSTANCE = new KIXModulesService();
        }
        return KIXModulesService.INSTANCE;
    }

    private constructor() { }

    private modules: IKIXModuleExtension[] = [];

    public async init(): Promise<void> {
        this.modules = await KIXModulesSocketClient.getInstance().loadModules();

        let tags = [];
        this.modules.forEach((m) => tags = [...tags, ...m.uiComponents.map((c) => [c.tagId, c.componentPath])]);
        ComponentsService.getInstance().init(tags);
    }

    public getModules(): IKIXModuleExtension[] {
        return this.modules;
    }

}
