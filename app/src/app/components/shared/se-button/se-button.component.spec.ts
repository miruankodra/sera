import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeButtonComponent} from './se-button.component';

describe('SeButtonComponent', () => {
  let component: SeButtonComponent;
  let fixture: ComponentFixture<SeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
