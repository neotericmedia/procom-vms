import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DocumentTypeService, DocumentType } from '../shared/index';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-document-type-rules',
  templateUrl: './document-type-rules.component.html',
  styleUrls: ['./document-type-rules.component.less']
})
export class DocumentTypeRulesComponent implements OnInit, OnDestroy {
  documentType: DocumentType;
  id: number;
  isAlive: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentTypeService: DocumentTypeService,

  ) { }

  ngOnInit() {
    this.route.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadDocumentType(this.id);
      });

  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadDocumentType(id: number, force: boolean = false) {

    this.documentTypeService.getDocumentType(id)
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe(value => {
        this.documentType = value;
      });
  }

}
