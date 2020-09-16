import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-testchild',
  templateUrl: './testchild.component.html',
  styleUrls: ['./testchild.component.less']
})
export class TestchildComponent implements OnInit {

  items: any[] = [];
  constructor() { }

  ngOnInit() {
    this.items.push({text: 'abc', id: 1});
    this.items.push({text: 'def', id: 2});
    this.items.push({text: 'ghi', id: 3});
    this.items.push({text: 'jkl', id: 4});
  }

  onSelect(data) {
    console.log(data);
  }

}
