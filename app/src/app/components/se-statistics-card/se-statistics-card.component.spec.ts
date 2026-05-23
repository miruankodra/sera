import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeStatisticsCardComponent} from './se-statistics-card.component';

describe('SeStatisticsCardComponent', () => {
  let component: SeStatisticsCardComponent;
  let fixture: ComponentFixture<SeStatisticsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeStatisticsCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeStatisticsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
