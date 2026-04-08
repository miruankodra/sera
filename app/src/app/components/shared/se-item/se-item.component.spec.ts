import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeItemComponent} from './se-item.component';

describe('SeItemComponent', () => {
  let component: SeItemComponent;
  let fixture: ComponentFixture<SeItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
