/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TicketPlaceholderHandler } from '../../../src/core/browser/ticket';
import { LabelService, KIXObjectService } from '../../../src/core/browser';
import { DateTimeUtil, KIXObjectProperty, Ticket, User, UserProperty, UserPreference, KIXObjectType } from '../../../src/core/model';
import { UserLabelProvider, UserPlaceholderHandler } from '../../../src/core/browser/user';
import { AgentService } from '../../../src/core/browser/application/AgentService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for user', () => {

    let user: User
    let userPlaceholderHandler: UserPlaceholderHandler = new UserPlaceholderHandler();
    let orgFunction;
    before(() => {
        user = someTestFunctions.prepareUser();

        const userLabelProvider = new UserLabelProvider();
        userLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(userLabelProvider);

        orgFunction = AgentService.getInstance().getCurrentUser;
        AgentService.getInstance().getCurrentUser = async () => {
            return user;
        }
    });

    after(() => {
        AgentService.getInstance().getCurrentUser = orgFunction;;
    });

    describe('Replace simple current user attribute placeholder.', async () => {

        it('Should replace user ID placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_ID}>`);
            expect(text).equal(user.UserID.toString());
        });

        it('Should replace user login placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_LOGIN}>`);
            expect(text).equal(user.UserLogin);
        });

        it('Should replace user firstname placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_FIRSTNAME}>`);
            expect(text).equal(user.UserFirstname);
        });

        it('Should replace user lastname placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_LASTNAME}>`);
            expect(text).equal(user.UserLastname);
        });

        it('Should replace user fullname placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_FULLNAME}>`);
            expect(text).equal(user.UserFullname);
        });

        it('Should replace user email placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_EMAIL}>`);
            expect(text).equal(user.UserEmail);
        });

        it('Should replace user mobil placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_MOBILE}>`);
            expect(text).equal(user.UserMobile);
        });

        it('Should replace user phone placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_PHONE}>`);
            expect(text).equal(user.UserPhone);
        });

        it('Should replace user comment placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_COMMENT}>`);
            expect(text).equal(user.UserComment);
        });

        it('Should replace user create by placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CREATE_BY}>`);
            expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        });

        it('Should replace user change by placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CHANGE_BY}>`);
            expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        });

        it('Should replace user valid id placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.VALID_ID}>`);
            expect(text).equal(user.ValidID.toString());
        });

        it('Should replace user valid placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_VALID}>`);
            expect(text).equal(`${UserProperty.USER_VALID}_Name`);
        });

        it('Should replace user language placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_LANGUAGE}>`);
            expect(text).equal('en');
        });
    });

    describe('Replace complex user attribute placeholder (translatable).', async () => {

        it('Should replace user create time placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CREATE_TIME}>`);
            const date = await DateTimeUtil.getLocalDateTimeString(user.CreateTime, 'en');
            expect(text).equal(date);

            const germanText = await userPlaceholderHandler.replace(`<TR_KIX_CURRENT_${KIXObjectProperty.CREATE_TIME}>`, null, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(user.CreateTime, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CREATE_TIME}>`, null, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace user change time placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CHANGE_TIME}>`);
            const date = await DateTimeUtil.getLocalDateTimeString(user.ChangeTime, 'en');
            expect(text).equal(date);

            const germanText = await userPlaceholderHandler.replace(`<TR_KIX_CURRENT_${KIXObjectProperty.CHANGE_TIME}>`, null, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(user.ChangeTime, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CHANGE_TIME}>`, null, 'de');
            expect(notGermanText).equal(date);
        });
    });

    describe('Replace dynamic field user attribute placeholder.', async () => {

    });

    describe('Replace unknown or emtpy user attribute placeholder with empty string.', async () => {

        it('Should replace unknown user attribute placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_UnknownAttribute>`);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty user attribute placeholder', async () => {
            const empty_1 = await userPlaceholderHandler.replace(`<KIX_CURRENT_>`);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await userPlaceholderHandler.replace(`<KIX_CURRENT>`);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

    describe('Replace with user placeholder from ticket.', async () => {

        const ticket: Ticket = new Ticket();
        let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
        const owner: User = new User();
        const responsible: User = new User();
        let orgLoadFuntion;
        before(() => {
            owner.UserFirstname = 'Owner';
            owner.UserEmail = 'owner@ticket.com';
            responsible.UserFirstname = 'Responsible';
            responsible.UserEmail = 'respnsible@ticket.com';
            ticket.OwnerID = 2;
            ticket.ResponsibleID = 3;
            orgLoadFuntion = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async (objectType, objectIds: Array<string | number>) => {
                let objects: User[] = [];
                if (objectIds && objectType === KIXObjectType.USER) {
                    if (objectIds[0] === ticket.OwnerID) {
                        objects = [owner];
                    }
                    if (objectIds[0] === ticket.ResponsibleID) {
                        objects = [responsible];
                    }
                }
                return objects as any[];
            }
        });

        after(() => {
            KIXObjectService.loadObjects = orgLoadFuntion;
        });

        it('Should replace user attribute placeholder from owner', async () => {
            const firstname = await ticketPlaceholderHandler.replace(`<KIX_OWNER_${UserProperty.USER_FIRSTNAME}>`, ticket);
            expect(firstname).exist;
            expect(firstname, 'should be firstname of ticket owner').equal(owner.UserFirstname);
            const email = await ticketPlaceholderHandler.replace(`<KIX_TICKETOWNER_${UserProperty.USER_EMAIL}>`, ticket);
            expect(email).exist;
            expect(email, 'should be email of ticket owner').equal(owner.UserEmail);
        });

        it('Should replace user attribute placeholder from responsible', async () => {
            const firstname = await ticketPlaceholderHandler.replace(`<KIX_RESPONSIBLE_${UserProperty.USER_FIRSTNAME}>`, ticket);
            expect(firstname).exist;
            expect(firstname, 'should be firstname of ticket responsible').equal(responsible.UserFirstname);
            const email = await ticketPlaceholderHandler.replace(`<KIX_TICKETRESPONSIBLE_${UserProperty.USER_EMAIL}>`, ticket);
            expect(email).exist;
            expect(email, 'should be email of ticket responsible').equal(responsible.UserEmail);
        });
    });
});

class someTestFunctions {
    public static async changedGetDisplayTextMethod(user: User, property: string): Promise<string> {
        let displayValue = user[property];
        switch (property) {
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY:
            case UserProperty.LAST_LOGIN:
            case UserProperty.USER_VALID:
                displayValue = `${property}_Name`;
                break;
            case UserProperty.USER_LANGUAGE:
                if (user.Preferences) {
                    const languagePreference = user.Preferences.find((p) => p.ID === UserProperty.USER_LANGUAGE);
                    if (languagePreference) {
                        displayValue = languagePreference.Value;
                    }
                }
                break;
            default:
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareUser(): User {
        const user = new User();
        const preference = new UserPreference();

        preference.ID = UserProperty.USER_LANGUAGE;
        preference.Value = 'en';

        user.UserID = 2;
        user.UserLogin = 'PlaceholderTest';
        user.UserFirstname = 'Placeholder';
        user.UserLastname = 'Test';
        user.UserFullname = 'Placeholder Test';
        user.UserEmail = 'placeholder@test.com';
        user.UserMobile = '0123 456789';
        user.UserPhone = '9876 54321';
        user.ValidID = 1;
        user.UserTitle = 'some title';
        user.UserComment = 'some comment';
        user.CreateTime = '2019-05-30 08:45:30';
        user.CreateBy = 1;
        user.ChangeTime = '2019-06-05 10:45:30';
        user.ChangeBy = 2;
        user.Preferences = [
            preference
        ]

        return user;
    }
}