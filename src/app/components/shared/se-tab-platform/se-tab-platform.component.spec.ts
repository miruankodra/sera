import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeTabPlatformComponent} from './se-tab-platform.component';

describe('SeTabPlatformComponent', () => {
  let component: SeTabPlatformComponent;
  let fixture: ComponentFixture<SeTabPlatformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeTabPlatformComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeTabPlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
