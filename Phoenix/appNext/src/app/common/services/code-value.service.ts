import { Injectable, Inject } from '@angular/core';
import { CodeValue } from '../model/code-value';
import * as _ from 'lodash';

@Injectable()
export class CodeValueService {
  constructor() {}

  public getCodeValueText(id: number, groupName: string): string {
    let result = '';

    const codeValue = this.getCodeValue(id, groupName);
    if (codeValue && codeValue.text) {
      result = codeValue.text;
    }

    return result;
  }

  public getCodeValueCode(id: number, groupName: string): string {
    let result = '';

    const codeValue = this.getCodeValue(id, groupName);
    if (codeValue && codeValue.code) {
      result = codeValue.code;
    }

    return result;
  }

  public getCodeValue(id: number, groupName: string): CodeValue {
    let result = null;

    const codeValues = (<any>window).PhoenixCodeValues;
    if (codeValues) {
      // tslint:disable-next-line:triple-equals
      result = codeValues.find(c => c.id === +id && c.groupName === groupName);
    }
    return result;
  }

  public getParentId(groupName: string, id: number): number {
    if (!groupName) {
      console.error('CodeValueService.getParentId groupName is empty');
    }
    let parentId = 0;
    const codeValues = (<any>window).PhoenixCodeValues;
    if (codeValues) {
      codeValues.forEach(function(item) {
        if (item.groupName === groupName && item.id === id) {
          parentId = item.parentId;
        }
      });
    }
    return parentId;
  }

  public getRelatedCodeValues(groupName: string, parentId: number, parentGroup: string): Array<CodeValue> {
    const result = [];

    if (!groupName) {
      console.error('CodeValueService.getRelatedCodeValues groupName is empty');
    }

    const codeValues = (<any>window).PhoenixCodeValues;
    if (codeValues) {
      codeValues.forEach(function(item) {
        if (item.groupName === groupName) {
          if (item.parentId === parentId && item.parentGroup === parentGroup) {
            result.push(item);
          }
        }
      });
    }

    return result.sort((a: CodeValue, b: CodeValue) => {
      return a.sortOrder - b.sortOrder;
    });
  }

  public getCodeValues(groupName: string, required): Array<CodeValue> {
    if (!groupName) {
      console.error('CodeValueService.getCodeValues groupName is empty');
    }

    const codeValues = (<any>window).PhoenixCodeValues;
    const result = [];

    if (required === false) {
      // add first empty item
      result.push({ id: null, text: '   ', value: null });
    }

    if (codeValues) {
      codeValues.forEach(function(item) {
        if (item.groupName === groupName) {
          result.push(item);
        }
      });
    }

    return result.sort((a: CodeValue, b: CodeValue) => {
      return a.sortOrder - b.sortOrder;
    });
  }

  public getCodeValuesSortByCode(groupName: string, required): Array<CodeValue> {
    return this.getCodeValues(groupName, required).sort((a: CodeValue, b: CodeValue) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    });
  }

  public getCodeValuesSortByText(groupName: string, required): Array<CodeValue> {
    return this.getCodeValues(groupName, required).sort((a: CodeValue, b: CodeValue) => {
      if (a.text < b.text) {
        return -1;
      }
      if (a.text > b.text) {
        return 1;
      }
      return 0;
    });
  }
}
