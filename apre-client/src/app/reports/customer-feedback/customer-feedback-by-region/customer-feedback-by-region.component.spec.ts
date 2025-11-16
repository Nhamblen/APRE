import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerFeedbackByRegionComponent } from './customer-feedback-by-region.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('CustomerFeedbackByRegionComponent', () => {
  let component: CustomerFeedbackByRegionComponent;
  let fixture: ComponentFixture<CustomerFeedbackByRegionComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackByRegionComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackByRegionComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  afterEach(() => {
    // Ensure no HTTP requests remain
    httpMock.verify();
  });

  // Component creates
  it('should create', () => {
    // Respond to the initial API call
    httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-region`
    ).flush([]);

    expect(component).toBeTruthy();
  });

  // Load data
  it('should load data', () => {
    const mockData = [
      { region: 'North America', averageRating: 4.5, feedback: [] }
    ];

    // Flush mock response
    httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-region`
    ).flush(mockData);

    // Expect data to be assigned
    expect(component.data.length).toBe(1);
  });

  // Show error on empty data
  it('should show error when no data returned', () => {
    // Flush empty response
    httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-region`
    ).flush([]);

    // Expect error message to appear
    expect(component.errorMessage).toBe('No customer feedback data found.');
  });
});
