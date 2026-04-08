import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeBadgeComponent} from './se-badge.component';

describe('SeBadgeComponent', () => {
  let component: SeBadgeComponent;
  let fixture: ComponentFixture<SeBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeBadgeComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
