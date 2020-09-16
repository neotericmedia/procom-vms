import { PhxLocalizationService } from './../common/services/phx-localization.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit {
    localization = {
        homeLabel           :   'HOME',
        contactLabel        :   'CONTACT',
        loginLabel          :   'LOGIN',
        slogan1Label        :   'More Engagements',
        slogan2Label        :   'Less Paperwork',
        slogan3Label        :   'Contract Management Tools and Solutions for',
        slogan4Label        :   'Freelancers and Staffing Companies',
        featuresTitle       :   'AT A GLANCE',
        feature1Message     :   'Create and manage multiple contract engagements over their full lifecycle',
        feature2Message     :   'Timesheet and Expense management, no problem!',
        feature3Message     :   'Full support for agency operations, ranging from commissions to reporting.',
        feature4Message     :   'Back office compliance and governance workflows make risk management a snap',
        feature5Message     :   'Simple Contract publishing and full document management',
        feature6Message     :   'Easy ATS and accounting system integrations',
        description1Message :   'Staffing can be tough, but back office should be easy. Easy for you, easy for your clients and easy for your contractors on assignment. FLEXBackOffice can help.',
        contactUs1Message   :   'Ready for easy? Contact us for a demo.',
        contactUsLabel      :   'CONTACT US',
        query1Label         :   'Do you have questions about how FLEXBackOffice can help your business?',
        query2Label         :   'Fill out the form below and one of our product specialists will be in touch.',
        addressLine1Label   :   '1121 Situs Court, Suite 360',
        addressLine2Label   :   'Raleigh, North Carolina',
        addressLine3Label   :   '27606',
        emailAddressLabel   :   'info@FLEXBackOffice.com',
        copyrightMessage    :   '2017 © FLEXBackOffice, All Rights Reserved'
    };

    public menuOpen = false;
    constructor(
        private router: Router,
        private localizationService: PhxLocalizationService,
        ) { }

    ngOnInit() {
        const self = this;
        Object.keys(this.localization).forEach(
            function(key, index)
            {
                self.localization[key] = self.localizationService.translate('account.home.' + key);
            });
    }

    menuButtonClick() {
        this.menuOpen = !this.menuOpen;
    }

    // Need to remove jQuery
    scrollToAnchor(target) {
        // fix me
        // const e_anchor = jQuery(target);

        // if (!e_anchor.length) {
        //     return true;
        // }

        // jQuery('html, body').animate({
        //     scrollTop: e_anchor.offset().top
        // });
    }
}
