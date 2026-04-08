import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeSelectComponent} from './se-select.component';

describe('SeSelectComponent', () => {
  let component: SeSelectComponent;
  let fixture: ComponentFixture<SeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeSelectComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
