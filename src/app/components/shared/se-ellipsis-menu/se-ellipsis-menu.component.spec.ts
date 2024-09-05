import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SeEllipsisMenuComponent} from './se-ellipsis-menu.component';

describe('SeEllipsisMenuComponent', () => {
  let component: SeEllipsisMenuComponent;
  let fixture: ComponentFixture<SeEllipsisMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeEllipsisMenuComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeEllipsisMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
