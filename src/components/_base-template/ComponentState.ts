export class ComponentState {

    public constructor(
        public gridColumns: string = null,
        public hasExplorer: boolean = false,
        public showSidebar: boolean = false,
        public loading: boolean = true,
        public loadingHint: string = 'Loading',
        public reload: boolean = false,
        public initialized: boolean = false
    ) { }

}
