import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-boolean-field',
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.scss']
})
export class BooleanFieldComponent implements OnInit, AfterViewInit {
  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: boolean;
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {
    if(!this.value){
      this.modelChanged(false);
    }
  }

  ngAfterViewInit(): void {
    // if(!this.value){
    //   this.modelChanged(false);
    // }
  }

  modelChanged(value: boolean) {
    this.value = value;
    this.valueChanges.next({property: this.property, value: this.value});
  }

}
