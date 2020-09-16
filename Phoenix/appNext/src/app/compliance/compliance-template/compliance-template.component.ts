import { Component, OnInit } from '@angular/core';
import { ComplianceTemplate, ComplianceTemplateService } from '../shared/index';
import { NavigationBarItem } from '../../common/model/index';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NavigationService } from '../../common/index';

@Component({
  selector: 'app-compliance-template',
  templateUrl: './compliance-template.component.html',
  styleUrls: ['./compliance-template.component.less']
})
export class ComplianceTemplateComponent implements OnInit {

  template: ComplianceTemplate;
  id: number;

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
      Id: 9,
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
    private navigationService: NavigationService,
    private complianceTemplateService: ComplianceTemplateService
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
        this.navigationService.setTitle('compliance-template-viewedit');
        this.loadTemplate(this.id);
      });
  }

  loadTemplate(id: number, force: boolean = false) {
    this.complianceTemplateService.getTemplateById(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.template = data;
      });
  }
}
