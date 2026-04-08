import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeLocationLabelComponent} from './se-location-label.component';

describe('SeLocationLabelComponent', () => {
  let component: SeLocationLabelComponent;
  let fixture: ComponentFixture<SeLocationLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeLocationLabelComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeLocationLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
