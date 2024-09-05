import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeGreenhouseInfoComponent} from './se-greenhouse-info.component';

describe('SeGreenhouseInfoComponent', () => {
  let component: SeGreenhouseInfoComponent;
  let fixture: ComponentFixture<SeGreenhouseInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeGreenhouseInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeGreenhouseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
