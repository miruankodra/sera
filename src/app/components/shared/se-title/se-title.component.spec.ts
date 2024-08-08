import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeTitleComponent} from './se-title.component';

describe('SeTitleComponent', () => {
  let component: SeTitleComponent;
  let fixture: ComponentFixture<SeTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeTitleComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
