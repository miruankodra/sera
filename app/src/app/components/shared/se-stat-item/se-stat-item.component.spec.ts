import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeStatItemComponent} from './se-stat-item.component';

describe('SeStatItemComponent', () => {
  let component: SeStatItemComponent;
  let fixture: ComponentFixture<SeStatItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeStatItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeStatItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
