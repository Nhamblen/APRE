import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFeedbackByRegionComponent } from './customer-feedback-by-region.component';

describe('CustomerFeedbackByRegionComponent', () => {
  let component: CustomerFeedbackByRegionComponent;
  let fixture: ComponentFixture<CustomerFeedbackByRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackByRegionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackByRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
