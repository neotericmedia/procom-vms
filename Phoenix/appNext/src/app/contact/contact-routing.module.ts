import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactSearchComponent } from './contact-search/contact-search.component';
import { ContactInternalTeamSearchComponent } from './contact-internalteam-search/contact-internalteam-search.component';
import { ContactSubscriptionsComponent } from './contact-subscriptions/contact-subscriptions.component';
import { PendingDocumentSearchComponent } from './pending-document-search/pending-document-search.component';
import { ReassignmentComponent } from './reassignment/reassignment.component';
import { ContactComponent } from './contact/contact.component';
import { ContactAddNewComponent } from './contact-add-new/contact-add-new.component';
import { PhxConstants } from '../common/model';
import { ContactTransactionAdjustmentComponent } from './contact-transaction-adjustment/contact-transaction-adjustment.component';
import { UserProfileResolver } from './contact-resolver-service';

export const ContactRouting = RouterModule.forChild([
    { path: 'search', component: ContactSearchComponent, pathMatch: 'full', },
    { path: 'wizardorganizationalprofile/organization/:organizationId', component: ContactAddNewComponent, pathMatch: 'full', data: { profileType: PhxConstants.NewProfile.WizardOrganizationalProfile } },
    { path: 'wizardorganizationalprofile', component: ContactAddNewComponent, pathMatch: 'full', data: { profileType: PhxConstants.NewProfile.WizardOrganizationalProfile } },
    { path: 'wizardworkerprofile', component: ContactAddNewComponent, pathMatch: 'full', data: { profileType: PhxConstants.NewProfile.WizardWorkerProfile }},
    { path: 'wizardinternalprofile', component: ContactAddNewComponent, pathMatch: 'full', data: { profileType: PhxConstants.NewProfile.WizardInternalProfile } },
    {
        path: 'search/declined', component: ContactSearchComponent, pathMatch: 'full', data: {
            dataSourceUrl: 'Contact/getDeclinedProfiles',
            dataGridComponentName: 'userProfileDeclinedSearch',
            pageTitle: 'Declined Profiles'
        }
    },
    {
        path: 'search/pending-review', component: ContactSearchComponent, pathMatch: 'full',
        data: {
            dataSourceUrl: 'Contact/Search',
            oDataParameterFilters: '&$filter=(UserStatusId eq 6)', // ApplicationConstants.ContactStatus.PendingReview
            dataGridComponentName: 'userProfilePendingReviewSearch',
            pageTitle: 'Profiles Pending Review'

        }
    },
    { path: 'internalteam-search', component: ContactInternalTeamSearchComponent, pathMatch: 'full' },
    { path: 'subscriptions', component: ContactSubscriptionsComponent, pathMatch: 'full' },
    {
        path: 'subscriptions/pending-review', component: ContactSubscriptionsComponent, pathMatch: 'full',
        data: {
            dataSourceUrl: 'AccessSubscription/getPendingSubscriptions',
            oDataParameterFilters: '&$filter=(AccessSubscriptionStatusId eq \'3\')',
            dataGridComponentName: 'subscriptionsPendingReview',
            pageTitle: 'Subscriptions Pending Review'

        }
    },
    { path: 'pending-documents', component: PendingDocumentSearchComponent, pathMatch: 'full', },
    { path: 'transaction/adjustment/:userProfileId/:workOrderVersionId', component: ContactTransactionAdjustmentComponent, pathMatch: 'full', },
    { path: 'internal-user-reassign/contact/:contactId/profile/:sourceProfileId', component: ReassignmentComponent, pathMatch: 'full' },
    // { path: ':contactId',  children: [
    //      { path: 'profile', children: [
    //          { path: ':profileType/:profileId', component: ContactComponent}
    //      ] }
    // ]}
    {
        path: ':contactId/profile/:profileType/:profileId', children: [
            {
                path: ':tabId', component: ContactComponent
            },
            {
                path: '', component: ContactComponent, pathMatch: 'full'
            },
        ]
    },
    {
        path: 'userprofile/:profileId', resolve: {UserProfileResolver}
    }
]);
