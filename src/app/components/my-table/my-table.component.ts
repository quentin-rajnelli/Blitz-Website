import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MyModalService } from '../../services/my-modal/my-modal.service';
import { v4 as uuid } from 'uuid';

export interface TableSettingColumns {
  name: string;
  title: string | string[];
  type?: string;
}

export interface TableSetting {
    title?: string | string[];
    noDataText?: string | string[];
    addButton?: boolean;
    clickable?: boolean;
    previous?: boolean;
    next?: boolean;
    numberOfPage?: number;
    page?: number;
    removeButton?: boolean;
    editButton?: boolean;
    downloadButton?: boolean;
    openTabButton?: boolean;
    allowFiltering?: boolean;
    columns?: TableSettingColumns[];
}


@Component({
  selector: 'app-my-table',
  templateUrl: './my-table.component.html',
  styleUrls: ['./my-table.component.scss']
})
export class MyTableComponent implements OnInit, OnChanges {

  @Input() settings: TableSetting;
  @Input() data: any;
  @Input() filters: any[];
  @Input() confirmationOnDeletion = true;
  @Input() limitChoices: number[] = null;
  @Input() useSearchBar = false;

  @Output() selectItem: EventEmitter<any> = new EventEmitter();
  @Output() openTabItem: EventEmitter<any> = new EventEmitter();
  @Output() downloadItem: EventEmitter<any> = new EventEmitter();
  @Output() editItem: EventEmitter<any> = new EventEmitter();
  @Output() removeItem: EventEmitter<any> = new EventEmitter();
  @Output() addButton: EventEmitter<any> = new EventEmitter();
  @Output() changePage: EventEmitter<any> = new EventEmitter();
  @Output() updateFilters: EventEmitter<any> = new EventEmitter();
  @Output() updateLimit: EventEmitter<any> = new EventEmitter();
  @Output() searchBar: EventEmitter<any> = new EventEmitter();

  selectedItem: any;
  uuid: string;
  deleteModalName: string;
  pagination = [];
  selectionnedFilters = [];

  typingTimer;
  doneTypingInterval = 1500;
  searchBarText: string;

  constructor(private myModalService: MyModalService) { }

  ngOnInit() {
    this.uuid = uuid();
    this.deleteModalName = 'delete_table_' + this.uuid;
  }

  ngOnChanges () {
    this.generateListOfPage(this.settings.page, this.settings.numberOfPage);
  }

  generateListOfPage(page: number, numberOfPage: number) {
    const pagination = [];
    const previous = page - 1;
    const next = page + 1;

    if (page > 1) {
      pagination.push(this.paginationAdaptater('<', previous));
    }
    if (page > 1) {
      pagination.push(this.paginationAdaptater(1, 1));
    }
    if (page > 3) {
      pagination.push(this.paginationAdaptater('...', null));
    }
    if (page > 2) {
      pagination.push(this.paginationAdaptater(previous, previous));
    }
    if (numberOfPage > 1) {
      pagination.push(this.paginationAdaptater(page, page, true));
    }
    if (page < numberOfPage - 1) {
      pagination.push(this.paginationAdaptater(next, next));
    }
    if (page < numberOfPage - 2) {
      pagination.push(this.paginationAdaptater('...', null));
    }
    if (page < numberOfPage) {
      pagination.push(this.paginationAdaptater(numberOfPage, numberOfPage));
    }
    if (page < numberOfPage) {
      pagination.push(this.paginationAdaptater('>', next));
    }

    this.pagination = pagination;
  }

  paginationAdaptater(name, index, active = false) {
    return {
      name: name,
      index: index,
      active: active
    };
  }

  clickItem(event: Event, item) {
    if (this.settings.clickable) {
      const target = (event.target as HTMLElement);

      if (!target.classList.contains('actionnable')) {
        this.selectItem.emit(item);
      }
    }
  }

  openTab(item) {
    this.openTabItem.emit(item);
  }

  download(item) {
    this.downloadItem.emit(item);
  }

  edit(item) {
    this.editItem.emit(item);
  }

  goToPage(index) {
    this.changePage.emit(index);
  }

  remove(item = null, force = false) {
    if (item) {
      this.selectedItem = item;
    }

    if (this.confirmationOnDeletion && !force) {

      const modal = this.myModalService.get(this.deleteModalName);

      if (!modal) {
        return;
      }

      modal.toggle();
    } else {
      this.removeItem.emit(this.selectedItem);
    }
  }

  add() {
    this.addButton.emit(null);
  }

  displayActionColumn() {
    return this.settings.removeButton || this.settings.editButton || this.settings.downloadButton;
  }

  getNumberOfColumns() {
    if (this.displayActionColumn()) {
      return this.settings.columns.length + 1;
    } else {
      return this.settings.columns.length;
    }
  }

  addFilter(value) {
    for (const filter of this.filters) {
      if (filter.name === value) {
        const newFilter = {
          'display': filter.display,
          'name': value,
          'value': null,
          'comparator': filter.comparators[0],
          'comparators': filter.comparators,
        };
        this.selectionnedFilters.push(newFilter);
      }
    }
  }

  resetFilters() {
    this.selectionnedFilters = [];
    this.applyFilters();
  }

  applyFilters() {
    this.updateFilters.emit(this.selectionnedFilters);
  }

  changeLimit(newLimit) {
    this.updateLimit.emit(newLimit);
  }

  changeSearch() {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(
      () => {
        this.searchBar.emit(this.searchBarText);
      },
      this.doneTypingInterval
    );
  }

  isTranslateData(data: any): boolean {
    return typeof data === 'string';
  }
}
