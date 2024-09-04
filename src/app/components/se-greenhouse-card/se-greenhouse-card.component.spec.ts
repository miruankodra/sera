import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeGreenhouseCardComponent} from './se-greenhouse-card.component';

describe('SeGreenhouseCardComponent', () => {
  let component: SeGreenhouseCardComponent;
  let fixture: ComponentFixture<SeGreenhouseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeGreenhouseCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeGreenhouseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
