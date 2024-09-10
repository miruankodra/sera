import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeWelcomeHeaderComponent} from './se-welcome-header.component';

describe('SeWelcomeHeaderComponent', () => {
  let component: SeWelcomeHeaderComponent;
  let fixture: ComponentFixture<SeWelcomeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeWelcomeHeaderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeWelcomeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
