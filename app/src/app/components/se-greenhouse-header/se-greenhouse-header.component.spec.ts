import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeGreenhouseHeaderComponent} from './se-greenhouse-header.component';

describe('SeGreenhouseHeaderComponent', () => {
  let component: SeGreenhouseHeaderComponent;
  let fixture: ComponentFixture<SeGreenhouseHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeGreenhouseHeaderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeGreenhouseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
