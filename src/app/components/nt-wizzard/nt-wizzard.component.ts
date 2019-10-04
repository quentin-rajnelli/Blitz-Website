import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

export interface WizzardItem {
  name: string;
  activated?: boolean;
  completed?: boolean;
}

@Component({
  selector: 'app-nt-wizzard',
  templateUrl: './nt-wizzard.component.html',
  styleUrls: ['./nt-wizzard.component.scss']
})
export class NtWizzardComponent implements OnInit {

  items: WizzardItem[] = [
    {
      'name': 'nt-wizzard.informations'
    },
    {
      'name': 'nt-wizzard.verification'
    },
    {
      'name': 'nt-wizzard.confirmation'
    },
    {
      'name': 'nt-wizzard.subscription'
    }
  ];

  @Input() active: number;

  constructor(private translate: TranslateService) { }

  translateItems() {
    for (const item of this.items) {
      this.translate.get(item.name).subscribe(
        (translatedLabel: string) => {
          item.name = translatedLabel;
        }
      );
    }
  }

  ngOnInit() {
    this.translateItems();
    if (this.active !== null) {
      let count = 0;
      for (const item of this.items) {
        if (count === this.active) {
          item.activated = true;
          break;
        } else {
          item.completed = true;
          count += 1;
        }
      }
    }
  }

  getIndex() {
    if (this.active) {
      return this.active + 1;
    } else {
      return 0;
    }
  }

  get maxWidth(): string{
    return `${100 / this.items.length}%`;
  }
}
