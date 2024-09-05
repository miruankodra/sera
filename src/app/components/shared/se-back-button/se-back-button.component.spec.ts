import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeBackButtonComponent} from './se-back-button.component';

describe('SeBackButtonComponent', () => {
  let component: SeBackButtonComponent;
  let fixture: ComponentFixture<SeBackButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeBackButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeBackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
