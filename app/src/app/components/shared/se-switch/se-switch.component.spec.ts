import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeSwitchComponent} from './se-switch.component';

describe('SeSwitchComponent', () => {
  let component: SeSwitchComponent;
  let fixture: ComponentFixture<SeSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeSwitchComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
