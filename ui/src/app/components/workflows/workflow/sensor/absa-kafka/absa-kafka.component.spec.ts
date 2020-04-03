import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsaKafkaComponent } from './absa-kafka.component';

describe('AbsaKafkaComponent', () => {
  let component: AbsaKafkaComponent;
  let fixture: ComponentFixture<AbsaKafkaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbsaKafkaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsaKafkaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
