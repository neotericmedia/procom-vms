import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { PaymentService } from './../payment.service';
import { CommonService } from '../../common/index';

@Component({
    selector: 'app-payment-document',
    templateUrl: './payment-document.component.html',
    styleUrls: ['./payment-document.component.less']
})
export class PaymentDocumentComponent implements OnInit, OnChanges {

    @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
    @Input() paymentTransactionId: number = null;
    @ViewChild('docFrame') docFrame;
    src: SafeResourceUrl;
    show: boolean = false;
    pdfUrlForTransaction: string = 'api/report/getPdfStreamForPaymentTransaction';

    constructor(
        private paymentService: PaymentService,
        private domSanitizer: DomSanitizer,
        private commonService: CommonService
    ) { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
         if (changes.paymentTransactionId && changes.paymentTransactionId.currentValue) {
                this.src = '';
                const paymentTransactionPdfUrl = 'api/report/getPaymentTransactionPdf';
                setTimeout(() => {
                    this.src = this.domSanitizer.bypassSecurityTrustResourceUrl(
                        `${this.commonService.api2Url}${paymentTransactionPdfUrl}/${this.paymentTransactionId}?access_token=${this.commonService.bearerToken()}`);
                });
            }
    }

    close() {
        this.onClose.emit();
    }
}
