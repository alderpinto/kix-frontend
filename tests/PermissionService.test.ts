/* tslint:disable*/
import * as chai from 'chai';
import { UIComponent } from '../src/core/model/UIComponent';
import { UIComponentPermission } from '../src/core/model/UIComponentPermission';
import { PermissionService } from '../src/services/PermissionService';
import { HttpService } from '../src/core/services';
import { OptionsResponse, RequestMethod } from '../src/core/api';
import { CRUD, ContextConfiguration, ConfiguredWidget, Error } from '../src/core/model';
import { HTTPUtil } from './utils/HTTPUtil';

const expect = chai.expect;
describe('Permission Service', () => {

    describe('Create new UIComponentPermission', () => {

        it('should have the CRUD value 2 for permission READ', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.READ]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(2);
        });

        it('should have the CRUD value 3 for permission CREATE & READ', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.READ]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(3);
        });

        it('should have the CRUD value 7 for permission CREATE & READ & UPDATE', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.READ, CRUD.UPDATE]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(7);
        });

        it('should have the CRUD value 15 for permission CREATE & READ & UPDATE & DELETE', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.READ, CRUD.UPDATE, CRUD.DELETE]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(15);
        });

        it('should have the CRUD value 9 for permission CREATE & DELETE', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.DELETE]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(9);
        });

    });

    describe('UI components permission filter for tickets (R)', () => {

        const uiComponents = [
            new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ])]),
            new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.READ])]),
            new UIComponent('test-tag-03', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.CREATE])]),
            new UIComponent('test-tag-04', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.UPDATE])]),
            new UIComponent('test-tag-05', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.READ])]),
            new UIComponent('test-tag-06', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE])])
        ];
        let originalOptionsMethod;

        before(() => {

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.POST]);
                } else if (resource === 'cmdb') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.POST]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(2);
        });
    });

    describe('UI components permission filter for tickets (CR)', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE])]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),]),
                new UIComponent('test-tag-03', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.UPDATE]),]),
                new UIComponent('test-tag-04', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE]),])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET, RequestMethod.POST]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'cmdb') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(1);
            expect(filteredComponents[0].tagId).equals('test-tag-01');
        });
    });

    describe('UI components permission filter for components without defined permission', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [])]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', []),]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(2);
        });
    });

    describe('UI components permission filter for components with multiplie resource permissions', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('edit-ticket-component', '/somwhere/tag01', [
                    new UIComponentPermission('tickets', [CRUD.READ, CRUD.UPDATE]),
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('contacts', [CRUD.READ])
                ]),
                new UIComponent('other-component', 'resource', [new UIComponentPermission('faq', [CRUD.READ])])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.PATCH]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags no tags if only one permission is given.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(0);
        });
    });

    describe('UI components permission filter for components with multiplie resource permissions', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('organisations-create', 'ticket-create', [
                    new UIComponentPermission('tickets', [CRUD.CREATE]),
                    new UIComponentPermission('organisations', [CRUD.READ])
                ]),
                new UIComponent('tickets-update', 'ticket-update', [
                    new UIComponentPermission('tickets', [CRUD.UPDATE])
                ]),
                new UIComponent('contacts-details', 'contacts-details', [
                    new UIComponentPermission('contacts', [CRUD.READ])
                ]),
                new UIComponent('tickets-info', 'ticket-info', [
                    new UIComponentPermission('tickets', [CRUD.READ]),
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('contacts', [CRUD.READ])
                ]),
                new UIComponent('tickets-info-2', 'ticket-info-2', [
                    new UIComponentPermission('tickets', [CRUD.READ]),
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('contacts', [CRUD.READ, CRUD.UPDATE])
                ]),
                new UIComponent('contact-info-2', 'contact-info-2', [
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('contacts', [CRUD.READ])
                ])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        });

        it('Should retrieve tags where the user has permissions for the resources.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(3);
        });
    });

    describe('Check permissions', () => {

        let originalOptionsMethod;

        before(() => {
            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ]);

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access if no permissions given', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', []);
            expect(allowed).true;
        });

        it('The permissions must be checked correctly and deny access if permissions are wrong', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ]),
                new UIComponentPermission('organisations', [CRUD.CREATE]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ]);

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access if multiple permissions needed', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ]);

            expect(allowed).false;
        });

    });

    describe('Check alternative (OR) permissions', () => {

        let originalOptionsMethod;

        before(() => {
            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.POST]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else {
                    return HTTPUtil.createOptionsResponse([]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ]);

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ]);

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('contacts', [CRUD.READ]),
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('organisations', [CRUD.READ], true)
            ]);

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and deny access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('organisations', [CRUD.UPDATE]),
                new UIComponentPermission('contacts', [CRUD.CREATE], true)
            ]);

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('contacts', [CRUD.CREATE]),
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('organisations', [CRUD.READ], true)
            ]);

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('organisations', [CRUD.READ], true)
            ]);

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and allow access (no permissions given)', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', []);
            expect(allowed).true;
        });

    });

    describe('Filter ContextConfiguration for permission', () => {

        const contextConfiguration = new ContextConfiguration(
            'contextId',
            [
                'sidebar01', 'sidebar02', 'sidebar03'
            ], [
                new ConfiguredWidget('sidebar01', null, [new UIComponentPermission('tickets', [CRUD.READ])]),
                new ConfiguredWidget('sidebar02', null, [new UIComponentPermission('cmdb', [CRUD.READ])]),
                new ConfiguredWidget('sidebar03', null, [new UIComponentPermission('organisations', [CRUD.READ])])
            ],
            [
                'explorer01', 'explorer02', 'explorer03'
            ], [
                new ConfiguredWidget('explorer01', null, [new UIComponentPermission('faq', [CRUD.READ])]),
                new ConfiguredWidget('explorer01', null, [new UIComponentPermission('cmdb', [CRUD.CREATE])]),
                new ConfiguredWidget('explorer01', null, [new UIComponentPermission('organisations', [CRUD.UPDATE])])
            ],
            [
                'lane01', 'lane02', 'lane03'
            ], [
                new ConfiguredWidget('lane01', null, [new UIComponentPermission('tickets', [CRUD.READ])]),
                new ConfiguredWidget('lane02', null, [new UIComponentPermission('faq', [CRUD.READ])]),
                new ConfiguredWidget('lane03', null, [new UIComponentPermission('cmdb', [CRUD.READ])])
            ],
            [
                'content01', 'content02', 'content03'
            ], [
                new ConfiguredWidget('content01', null, [new UIComponentPermission('tickets', [CRUD.READ])]),
                new ConfiguredWidget('content02', null, [new UIComponentPermission('organisations', [])]),
                new ConfiguredWidget('content03', null, [new UIComponentPermission('faq', [])]),
            ],
            [], [],
            [
                new ConfiguredWidget('overlay01', null, [new UIComponentPermission('tickets', [CRUD.READ])]),
                new ConfiguredWidget('overlay02', null, [new UIComponentPermission('faq', [CRUD.UPDATE])])
            ]
        );

        let originalOptionsMethod;

        before(() => {

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'cmdb') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else {
                    return HTTPUtil.createOptionsResponse([]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve a configuration with 2 sidebar widgets.', async () => {
            const config = await PermissionService.getInstance().filterContextConfiguration('test-token-1234', contextConfiguration);
            expect(config).exist;
            expect(config.sidebarWidgets).exist;
            expect(config.sidebarWidgets.length).equals(2);
        });

        it('Should retrieve a configuration with 1 explorer widgets.', async () => {
            const config = await PermissionService.getInstance().filterContextConfiguration('test-token-1234', contextConfiguration);
            expect(config).exist;
            expect(config.explorerWidgets).exist;
            expect(config.explorerWidgets.length).equals(1);
        });

        it('Should retrieve a configuration with 3 lane widgets.', async () => {
            const config = await PermissionService.getInstance().filterContextConfiguration('test-token-1234', contextConfiguration);
            expect(config).exist;
            expect(config.laneWidgets).exist;
            expect(config.laneWidgets.length).equals(3);
        });

        it('Should retrieve a configuration with 3 content widgets.', async () => {
            const config = await PermissionService.getInstance().filterContextConfiguration('test-token-1234', contextConfiguration);
            expect(config).exist;
            expect(config.contentWidgets).exist;
            expect(config.contentWidgets.length).equals(3);
        });

        it('Should retrieve a configuration with 3 content widgets.', async () => {
            const config = await PermissionService.getInstance().filterContextConfiguration('test-token-1234', contextConfiguration);
            expect(config).exist;
            expect(config.overlayWidgets).exist;
            expect(config.overlayWidgets.length).equals(1);
        });
    });

    describe('Options request with failure.', () => {

        let originalOptionsMethod;

        before(() => {

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                throw new Error('error', 'error');
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should return true if no permissions are given and the option request provides errors.', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('test-token-1234', []);
            expect(allowed).true;
        });

        it('Should return false if permissions are given and the option request provides errors.', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('test-token-1234', [new UIComponentPermission('somewhere', [CRUD.READ])]);
            expect(allowed).false;
        });
    });

});