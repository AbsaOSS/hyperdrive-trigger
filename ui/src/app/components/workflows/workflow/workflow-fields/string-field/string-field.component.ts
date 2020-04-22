import {AfterContentChecked, AfterContentInit, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-string-field',
  templateUrl: './string-field.component.html',
  styleUrls: ['./string-field.component.scss']
})
export class StringFieldComponent implements OnInit, AfterViewInit, AfterContentInit, AfterContentChecked {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<{ property: string, value: any }>;

  constructor() {
  }

  ngOnInit(): void {
    if (!this.value) {
      this.value = "";
      this.modelChanged("");
    }
  }

  ngAfterViewInit(): void {
    // if (!this.value) {
    //   this.value = "";
    //   this.modelChanged("");
    // }
  }

  ngAfterContentInit(): void {
  }

  ngAfterContentChecked(): void {
    // if (!this.value) {
    // }
    // if (!this.value) {
    //   this.value = "";
    //   this.modelChanged("");
    // }
  }

  modelChanged(value: string) {
    // this.value = value;
    this.valueChanges.next({property: this.property, value: this.value});
  }

}
