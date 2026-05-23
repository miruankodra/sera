import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeAccordionComponent} from './se-accordion.component';

describe('SeAccordionComponent', () => {
  let component: SeAccordionComponent;
  let fixture: ComponentFixture<SeAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeAccordionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
