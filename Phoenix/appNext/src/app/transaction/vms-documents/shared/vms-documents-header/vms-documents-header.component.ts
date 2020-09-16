import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VmsDocumentService } from '../../vms-document.service';
import { BaseComponentActionContainer } from '../../../../common/state/epics/base-component-action-container';
import { PhxConstants } from '../../../../common';

@Component({
  selector: 'app-vms-documents-header',
  templateUrl: './vms-documents-header.component.html'
})
export class VmsDocumentsHeaderComponent extends BaseComponentActionContainer implements OnInit {

  @Input() document: string ;
  @Input() constCodeValueGroups: string ;
  phxConstants: any;

  constructor(
    private vmsDocumentService: VmsDocumentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    super();
    this.phxConstants = PhxConstants;
  }
  ngOnInit(): void {
  }
}
