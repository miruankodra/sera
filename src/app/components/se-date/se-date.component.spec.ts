import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeDateComponent} from './se-date.component';

describe('SeDateComponent', () => {
  let component: SeDateComponent;
  let fixture: ComponentFixture<SeDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeDateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
