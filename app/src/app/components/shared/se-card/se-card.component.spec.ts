import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeCardComponent} from './se-card.component';

describe('SeCardComponent', () => {
  let component: SeCardComponent;
  let fixture: ComponentFixture<SeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
