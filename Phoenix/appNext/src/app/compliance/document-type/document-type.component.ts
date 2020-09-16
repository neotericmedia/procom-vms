import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationBarItem } from '../../common/model/index';
import { DocumentTypeService, DocumentType } from '../shared/index';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NavigationService } from '../../common/services/navigation.service';
import { DialogService, PhxConstants } from '../../common/index';

@Component({
  selector: 'app-document-type',
  templateUrl: './document-type.component.html',
  styleUrls: ['./document-type.component.less']
})
export class DocumentTypeComponent implements OnInit, OnDestroy {
  id: number;
  documentType: DocumentType = <DocumentType>{};

  isAlive: boolean = true;
  currentUrl: string;
  currentTab: NavigationBarItem;
  tabList: NavigationBarItem[] = [
    {
      Id: 1,
      Name: 'detail',
      Path: './detail',
      DisplayText: 'Detail',
      Icon: '',
      IsDefault: true,
    },
    {
      Id: 2,
      Name: 'templates',
      Path: './templates',
      DisplayText: 'Templates',
      Icon: '',
      IsDefault: false,
    },
    {
      Id: 2,
      Name: 'rules',
      Path: './rules',
      DisplayText: 'Related Document Rules',
      Icon: '',
      IsDefault: false,
    },
    {
      Id: 4,
      Name: 'history',
      Path: './history',
      DisplayText: 'Change History',
      Icon: 'note',
      IsDefault: false
    },
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private documentTypeService: DocumentTypeService,
    private navigationService: NavigationService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;

    this.router.events
      .takeWhile(() => this.isAlive)
      .subscribe(
      (val) => {
        if (val instanceof NavigationEnd) {
          this.currentUrl = val.url;
        }
      });

    this.activatedRoute.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.navigationService.setTitle('document-types-viewedit');
        this.loadDocumentType(this.id);
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadDocumentType(id: number, force: boolean = false) {
    this.documentTypeService.getDocumentType(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.documentType = data;
      });

  }

  onTabSelected(tab: NavigationBarItem) {
    this.currentTab = tab;
  }

}
