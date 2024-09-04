import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeControlCardComponent} from './se-control-card.component';

describe('SeControlCardComponent', () => {
  let component: SeControlCardComponent;
  let fixture: ComponentFixture<SeControlCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeControlCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeControlCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
