import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeTapPlatformComponent} from './se-tap-platform.component';

describe('SeTapPlatformComponent', () => {
  let component: SeTapPlatformComponent;
  let fixture: ComponentFixture<SeTapPlatformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeTapPlatformComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeTapPlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
