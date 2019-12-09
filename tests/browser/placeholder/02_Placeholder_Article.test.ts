/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Article } from '../../../src/frontend-applications/agent-portal/modules/ticket/model/Article';
import { ArticlePlaceholderHandler, ArticleLabelProvider, TicketPlaceholderHandler } from '../../../src/frontend-applications/agent-portal/modules/ticket/webapp/core';
import { LabelService } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { ArticleProperty } from '../../../src/frontend-applications/agent-portal/modules/ticket/model/ArticleProperty';
import { DateTimeUtil } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectProperty } from '../../../src/frontend-applications/agent-portal/model/kix/KIXObjectProperty';
import { Ticket } from '../../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { ContextService } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ContextService';
import { ContextDescriptor } from '../../../src/frontend-applications/agent-portal/model/ContextDescriptor';
import { Context } from '../../../src/frontend-applications/agent-portal/model/Context';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for article', () => {

    let article: Article
    let articlePlaceholderHandler: ArticlePlaceholderHandler = new ArticlePlaceholderHandler();
    before(() => {
        article = someTestFunctions.prepareArticle();

        const articleLabelProvider = new ArticleLabelProvider();
        articleLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(articleLabelProvider);
    });

    after(() => {
        LabelService.getInstance()['labelProviders'] = [];
    });

    describe('Replace simple article attribute placeholder.', async () => {

        it('Should replace article ID placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.ARTICLE_ID}>`, article);
            expect(text).equal(article.ArticleID.toString());

            const simple_text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_ID>`, article);
            expect(simple_text, 'simple "ID" should also return article ID').equal(article.ArticleID.toString());
        });

        it('Should replace article ticket ID placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.TICKET_ID}>`, article);
            expect(text).equal(article.TicketID.toString());
        });

        it('Should replace article subject placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.SUBJECT}>`, article);
            expect(text).equal(article.Subject);
        });

        it('Should replace article subject placeholder - use only first 5 characters', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.SUBJECT}_5>`, article);
            expect(text).equal(article.Subject.substr(0, 5));
        });

        it('Should replace article body placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.BODY}>`, article);
            expect(text).equal(article.Body);
        });

        it('Should replace article body placeholder - use only first 5 characters', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.BODY}_5>`, article);
            expect(text).equal(article.Body.substr(0, 5));
        });

        it('Should replace article body richtext placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.BODY_RICHTEXT}>`, article);
            expect(text).equal('<p>some html text</p>');
        });

        it('Should replace article from placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.FROM}>`, article);
            expect(text).equal(article.From.replace('<', '&lt;').replace('>', '&gt;'));
        });

        it('Should replace article from realname placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.FROM_REALNAME}>`, article);
            expect(text).equal(article.FromRealname);
        });

        it('Should replace article to placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.TO}>`, article);
            expect(text).equal(article.To.replace('<', '&lt;').replace('>', '&gt;'));
        });

        it('Should replace article to realname placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.TO_REALNAME}>`, article);
            expect(text).equal(article.ToRealname);
        });

        it('Should replace article cc placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.CC}>`, article);
            expect(text).equal(article.Cc.replace('<', '&lt;').replace('>', '&gt;'));
        });

        it('Should replace article bcc placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.BCC}>`, article);
            expect(text).equal(article.Bcc.replace('<', '&lt;').replace('>', '&gt;'));
        });

        it('Should replace article incoming time placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.INCOMING_TIME}>`, article);
            const incomingTime = DateTimeUtil.calculateTimeInterval(Number(article.IncomingTime));
            expect(text).equal(incomingTime);
        });

        it('Should replace article created by placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.CREATED_BY}>`, article);
            expect(text).equal(`${ArticleProperty.CREATED_BY}_Name`);
        });

        it('Should replace article changed by placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${ArticleProperty.CHANGED_BY}>`, article);
            expect(text).equal(`${ArticleProperty.CHANGED_BY}_Name`);
        });
    });

    describe('Replace complex article attribute placeholder (translatable).', async () => {

        it('Should replace article create time placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${KIXObjectProperty.CREATE_TIME}>`, article);
            const date = await DateTimeUtil.getLocalDateTimeString(article.CreateTime, 'en');
            expect(text).equal(date);

            const germanText = await articlePlaceholderHandler.replace(`<TR_KIX_ARTICLE_${KIXObjectProperty.CREATE_TIME}>`, article, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(article.CreateTime, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${KIXObjectProperty.CREATE_TIME}>`, article, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace article change time placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${KIXObjectProperty.CHANGE_TIME}>`, article);
            const date = await DateTimeUtil.getLocalDateTimeString(article.ChangeTime, 'en');
            expect(text).equal(date);

            const germanText = await articlePlaceholderHandler.replace(`<TR_KIX_ARTICLE_${KIXObjectProperty.CHANGE_TIME}>`, article, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(article.ChangeTime, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_${KIXObjectProperty.CHANGE_TIME}>`, article, 'de');
            expect(notGermanText).equal(date);
        });
    });

    describe('Replace dynamic field article attribute placeholder.', async () => {

    });

    describe('Replace unknown or emtpy article attribute placeholder with empty string.', async () => {

        it('Should replace unknown article attribute placeholder', async () => {
            const text = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_UnknownAttribute>`, article);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty article attribute placeholder', async () => {
            const empty_1 = await articlePlaceholderHandler.replace(`<KIX_ARTICLE_>`, article);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await articlePlaceholderHandler.replace(`<KIX_ARTICLE>`, article);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

    describe('Replace with right article placeholder.', async () => {

        let ticket: Ticket;
        let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
        before(() => {
            ticket = someTestFunctions.prepareTicket();
        });

        it('Should replace article subject and body placeholder for first article', async () => {
            const subjectText = await ticketPlaceholderHandler.replace(`<KIX_FIRST_Subject>`, ticket);
            expect(subjectText).exist;
            expect(subjectText).equal('first article');
            const bodyText = await ticketPlaceholderHandler.replace(`<KIX_FIRST_Body>`, ticket);
            expect(bodyText).exist;
            expect(bodyText).equal('This is the first article');
        });

        it('Should replace article subject and body placeholder for last article', async () => {
            const subjectText = await ticketPlaceholderHandler.replace(`<KIX_LAST_Subject>`, ticket);
            expect(subjectText).exist;
            expect(subjectText).equal('last article');
            const bodyText = await ticketPlaceholderHandler.replace(`<KIX_LAST_Body>`, ticket);
            expect(bodyText).exist;
            expect(bodyText).equal('This is the last article');
        });

        it('Should replace article subject and body placeholder for last agent article', async () => {
            const subjectText = await ticketPlaceholderHandler.replace(`<KIX_AGENT_Subject>`, ticket);
            expect(subjectText).exist;
            expect(subjectText).equal('last agent article');
            const bodyText = await ticketPlaceholderHandler.replace(`<KIX_AGENT_Body>`, ticket);
            expect(bodyText).exist;
            expect(bodyText).equal('This is the last agent article');
        });

        it('Should replace article subject and body placeholder for last customer article', async () => {
            const subjectText = await ticketPlaceholderHandler.replace(`<KIX_CUSTOMER_Subject>`, ticket);
            expect(subjectText).exist;
            expect(subjectText).equal('last customer article');
            const bodyText = await ticketPlaceholderHandler.replace(`<KIX_CUSTOMER_Body>`, ticket);
            expect(bodyText).exist;
            expect(bodyText).equal('This is the last customer article');
        });

        describe('Replace with referenced article placeholder.', async () => {

            let orgFunction;
            before(async () => {
                const newArticleContext = new newArticlePlaceholderDialogContext();
                newArticleContext.setAdditionalInformation('REFERENCED_ARTICLE_ID', ticket.Articles[5].ArticleID);
                orgFunction = ContextService.getInstance().getActiveContext;
                ContextService.getInstance().getActiveContext = () => {
                    return newArticleContext;
                }
            });

            after(() => {
                ContextService.getInstance().getActiveContext = orgFunction;
            })

            it('Should replace article subject and body placeholder for referenced article', async () => {
                const subjectText = await ticketPlaceholderHandler.replace(`<KIX_ARTICLE_Subject>`, ticket);
                expect(subjectText).exist;
                expect(subjectText).equal(ticket.Articles[5].Subject);
                const bodyText = await ticketPlaceholderHandler.replace(`<KIX_ARTICLE_Body>`, ticket);
                expect(bodyText).exist;
                expect(bodyText).equal(ticket.Articles[5].Body);
            });
        });
    });
});

class newArticlePlaceholderDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-test-article-placeholder-dialog-context';

    public constructor(
        descriptor: ContextDescriptor = null,
        objectId: string | number = null,
        configuration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}

class someTestFunctions {
    public static async changedGetDisplayTextMethod(article: Article, property: string): Promise<string> {
        let displayValue = article[property];
        switch (property) {
            case ArticleProperty.CHANGED_BY:
            case ArticleProperty.CREATED_BY:
                displayValue = `${property}_Name`;
                break;
            case ArticleProperty.INCOMING_TIME:
                displayValue = DateTimeUtil.calculateTimeInterval(Number(displayValue));
                break;
            case ArticleProperty.BODY_RICHTEXT:
                displayValue = '<p>some html text</p>';
                break;
            default:
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareArticle(): Article {
        const article = new Article();

        article.ArticleID = 1;
        article.TicketID = 1;
        article.From = 'from somewhere <from@somewhere.com>';
        article.FromRealname = 'from somewhere';
        article.To = 'to anywhere <to@anywhere.com>,to2@anywhere.com';
        article.ToRealname = 'to anywhere, to2@anywhere.com';
        article.Cc = 'cc <cc@anywhere.com>,cc2 <cc@anywhere.com>';
        article.Bcc = 'bcc <bcc@anywhere.com>,bcc2 <bcc2@anywhere.com>';
        article.Subject = 'Test article';
        article.Body = 'this is a test text';
        article.ContentType = 'text/html;charset=utf-8';
        article.CreateTime = '2019-05-30 08:45:30';
        article.CreatedBy = 1;
        article.ChangeTime = '2019-06-05 10:45:30';
        article.ChangedBy = 2;
        article.IncomingTime = 456789;
        article.SenderTypeID = 1;
        article.SenderType = 'agent';

        return article;
    }

    public static prepareTicket(): Ticket {
        const ticket = new Ticket();

        const firstArticle = new Article();
        firstArticle.Subject = 'first article';
        firstArticle.Body = 'This is the first article';
        firstArticle.ArticleID = 1;

        const lastArticle = new Article();
        lastArticle.Subject = 'last article';
        lastArticle.Body = 'This is the last article';
        lastArticle.ArticleID = 10;

        const agentArticle = new Article();
        agentArticle.Subject = 'agent article';
        agentArticle.Body = 'This is a agent article';
        agentArticle.SenderTypeID = 1;
        agentArticle.SenderType = 'agent';
        agentArticle.ArticleID = 3;

        const agentArticle2 = new Article();
        agentArticle2.Subject = 'agent article 2';
        agentArticle2.Body = 'This is a agent article 2';
        agentArticle2.SenderTypeID = 1;
        agentArticle2.SenderType = 'agent';
        agentArticle2.ArticleID = 5;

        const agentArticle3 = new Article();
        agentArticle3.Subject = 'agent article 3';
        agentArticle3.Body = 'This is a agent article 3';
        agentArticle3.SenderTypeID = 1;
        agentArticle3.SenderType = 'agent';
        agentArticle3.ArticleID = 7;

        const lastAgentArticle = new Article();
        lastAgentArticle.Subject = 'last agent article';
        lastAgentArticle.Body = 'This is the last agent article';
        lastAgentArticle.SenderTypeID = 1;
        lastAgentArticle.SenderType = 'agent';
        lastAgentArticle.ArticleID = 9;

        const customerArticle = new Article();
        customerArticle.Subject = 'customer article';
        customerArticle.Body = 'This is a customer article';
        customerArticle.SenderTypeID = 2;
        customerArticle.SenderType = 'customer';
        customerArticle.ArticleID = 2;

        const customerArticle2 = new Article();
        customerArticle2.Subject = 'customer article 2';
        customerArticle2.Body = 'This is a customer article 2';
        customerArticle2.SenderTypeID = 2;
        customerArticle2.SenderType = 'customer';
        customerArticle2.ArticleID = 4;

        const customerArticle3 = new Article();
        customerArticle3.Subject = 'customer article 3';
        customerArticle3.Body = 'This is a customer article 3';
        customerArticle3.SenderTypeID = 2;
        customerArticle3.SenderType = 'customer';
        customerArticle3.ArticleID = 6;

        const lastCustomerArticle = new Article();
        lastCustomerArticle.Subject = 'last customer article';
        lastCustomerArticle.Body = 'This is the last customer article';
        lastCustomerArticle.SenderTypeID = 2;
        lastCustomerArticle.SenderType = 'customer';
        lastCustomerArticle.ArticleID = 8;

        ticket.Articles = [
            customerArticle,
            customerArticle2,
            customerArticle3,
            lastCustomerArticle,
            agentArticle,
            agentArticle2,
            agentArticle3,
            lastAgentArticle,
            firstArticle,
            lastArticle
        ];

        return ticket;
    }
}
