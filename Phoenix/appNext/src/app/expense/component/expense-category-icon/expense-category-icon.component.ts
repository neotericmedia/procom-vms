import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-expense-category-icon',
  templateUrl: './expense-category-icon.component.html',
  styleUrls: ['./expense-category-icon.component.less']
})
export class ExpenseCategoryIconComponent implements OnInit {
  @Input() icon: string;
  @Input() align : string = 'left';  // left or center
  @Input() size: string = 'md'; // sm or md or lg
  
  constructor() { }

  ngOnInit() {
  }

}
