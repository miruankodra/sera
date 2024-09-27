import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SePanelTabComponent } from './se-panel-tab.component';

describe('SePanelTabComponent', () => {
  let component: SePanelTabComponent;
  let fixture: ComponentFixture<SePanelTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SePanelTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SePanelTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
