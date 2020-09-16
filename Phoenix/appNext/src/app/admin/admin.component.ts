import { Component, OnInit } from '@angular/core';
import {CommonService } from '../common';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {
  constructor(private common: CommonService, private adminService: AdminService) {}

  ngOnInit() {}

  forceInvalidateCodecache() {
    this.adminService.forceInvalidateCodeCache().then((successObj) => {
        this.common.logSuccess('Code Cache successfully invalidated');
    }, (failObj) => {
        this.common.logError('Error invalidating Code Cache');
    });
  }

  forceInvalidateWorkflowcache() {
    this.adminService.forceInvalidateWorkflowCache().then((successObj) => {
        this.common.logSuccess('Workflow Cache successfully invalidated');
    }, (failObj) => {
        this.common.logError('Error invalidating Workflow Cache');
    });
  }
}
