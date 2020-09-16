import { BatchOperation } from './../../common/model/batch-operation';
import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivityCard, ActivityTotal } from '../model/index';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-activity-centre-search',
  templateUrl: './activity-centre-search.component.html',
  styleUrls: ['./activity-centre-search.component.less']
})
export class ActivityCentreSearchComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() cardList: Array<ActivityCard> = [];
  @Input() cardTotals: Array<ActivityTotal>;
  @Input() batchOperations: BatchOperation[] = [];
  @Input() hideBackButton: boolean = false;
  @Input() entityTypeId: number;

  @ViewChildren('cardContainer') cardsList: QueryList<any>;

  @Output() activityScroll = new EventEmitter<string>();
  @Output() drillDown = new EventEmitter<Array<ActivityTotal>>();
  @Output() executeBatchOperation = new EventEmitter<BatchOperation>();

  selectedCards: Set<ActivityCard> = new Set<ActivityCard>();
  totalCount: number;
  private isAlive: boolean = true;
  private selectAllCheckbox: { checked: boolean, indeterminate: boolean } = {
    checked: false,
    indeterminate: false
  };

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.cardList && changes.cardList.currentValue) {
      // not needed?
      this.cardList = changes.cardList.currentValue;
      this.updateSelectAllCheckbox();
    }
    if (changes && changes.cardTotals) {
      if (changes.cardTotals.currentValue && this.cardTotals !== changes.cardTotals.currentValue) {
        // not needed?
        this.cardTotals = changes.cardTotals.currentValue;
      }
      this.totalCount = 0;

      const hasFilter: boolean = this.cardTotals.some(x => x.isActive);
      for (const total of this.cardTotals) {
        if (!hasFilter || total.isActive) {
          this.totalCount += total.total;
        }
      }
    }

  }

  ngAfterViewInit() {
    this.utilizeMaximumScreenSpace();
  }

  private utilizeMaximumScreenSpace() {
    this.cardsList.changes.filter(
      () => !this.isScrollbarVisible()
    ).takeWhile(() => this.isAlive).subscribe(() => {
      this.onScroll();
    });
    Observable.fromEvent(window, 'resize').debounceTime(1000).filter(
      () => this.cardsList && !this.isScrollbarVisible()
    ).takeWhile(() => this.isAlive).subscribe(() => {
      this.onScroll();
    });
  }

  private isScrollbarVisible() {
    if (window.innerHeight >= document.body.offsetHeight) {
      return false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }


  public clearSelection() {
    this.deselectAllCards();
  }

  onScroll() {
    // https://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
    // const distanceFromBottom = 40;
    // if ( ( window.innerHeight + window.pageYOffset ) >= ( document.body.offsetHeight - distanceFromBottom ) ) {
    this.activityScroll.emit('scroll');
    // }
  }

  onDrillDown(totals: Array<ActivityTotal> = []) {
    this.drillDown.emit(totals);
  }

  selectAllCards() {
    this.selectedCards = new Set<ActivityCard>(this.cardList);
    this.selectedCards.forEach((x: ActivityCard) => x.selected = true);
    this.updateSelectAllCheckbox();
  }

  deselectAllCards() {
    this.selectedCards.forEach((x: ActivityCard) => x.selected = false);
    this.selectedCards.clear();
    this.updateSelectAllCheckbox();
  }

  selectCard(card: ActivityCard) {
    this.selectedCards.add(card);
    card.selected = true;
    this.updateSelectAllCheckbox();
  }

  deselectCard(card: ActivityCard) {
    this.selectedCards.delete(card);
    card.selected = false;
    this.updateSelectAllCheckbox();
  }

  onToggleCardSelection(card: ActivityCard) {
    const selected: boolean = this.selectedCards.has(card);
    if (!selected) {
      this.selectCard(card);
    } else {
      this.deselectCard(card);
    }
  }

  updateSelectAllCheckbox() {
    const allSelected: boolean = this.selectedCards.size === this.cardList.length;
    const noneSelected: boolean = this.selectedCards.size === 0;

    this.selectAllCheckbox.checked = allSelected;
    this.selectAllCheckbox.indeterminate = !allSelected && !noneSelected;
  }

  onTopLevelSelect() {
    if (this.selectAllCheckbox.checked) {
      this.deselectAllCards();
    } else {
      this.selectAllCards();
    }
  }

  onCallBatchOperation(operation: BatchOperation) {
    operation.TaskIdsToBatch = Array.from(this.selectedCards).map(x => x.pendingTaskId);
    this.executeBatchOperation.emit(operation);
  }

}
