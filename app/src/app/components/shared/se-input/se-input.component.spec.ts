import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeInputComponent} from './se-input.component';

describe('SeInputComponent', () => {
  let component: SeInputComponent;
  let fixture: ComponentFixture<SeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
