/** Major development task - client tests 11/2/25
 *
 * Create an API to fetch yearly sales data and build an Angular component to display
 * yearly sales using ChartComponent or TableComponent with 3 unit tests each.
 *
 * Implement the API to fetch yearly sales data and create a component to display
 * the data using either ChartComponent or TableComponent. Ensure both have 3 unit tests.
 *
 */


import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SalesByYearComponent } from './sales-by-year.component';
import { environment } from '../../../../environments/environment';

describe('SalesByYearComponent', () => {
  let fixture: ComponentFixture<SalesByYearComponent>;
  let component: SalesByYearComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.overrideComponent(SalesByYearComponent, {
      set: { template: '<!-- template stripped for unit tests -->' }
    });

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByYearComponent]
    }).compileComponents();

    // Create the component instance
    fixture = TestBed.createComponent(SalesByYearComponent);
    component = fixture.componentInstance;

    // Setup HttpTestingController to mock backend requests
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Test 1:
   * Should load yearly sales data successfully
   */
  it('should load and populate sales data when loadYearlySales is called', () => {
    component.onStartDateSelected(new Date(2023, 0, 1));
    component.onEndDateSelected(new Date(2024, 11, 31));

    component.loadYearlySales();

    const url = `${environment.apiBaseUrl}/reports/sales/sales-by-year?startYear=2023&endYear=2024`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');

    req.flush([
      { year: 2023, totalSales: 5000, count: 5 },
      { year: 2024, totalSales: 8000, count: 8 },
    ]);

    expect(component.chartData).toEqual([5000, 8000]);
    expect(component.chartLabels).toEqual(['2023', '2024']);
    expect(component.error).toBeNull();
  });

  /**
   * Test 2:
   * Should show no data when API returns empty result set
   */
  it('should show no data message if result is empty', () => {
    component.onStartDateSelected(new Date(2025, 0, 1));
    component.onEndDateSelected(new Date(2025, 11, 31));
    component.loadYearlySales();

    const url = `${environment.apiBaseUrl}/reports/sales/sales-by-year?startYear=2025&endYear=2025`;
    const req = httpMock.expectOne(url);
    req.flush([]);

    expect(component.chartData.length).toBe(0);
    expect(component.chartLabels.length).toBe(0);
    expect(component.error).toBeNull();
  });

  /**
   * Test 3:
   * Should show an error message if the backend fails
   */
  it('should set error message when the API fails', () => {
    component.onStartDateSelected(new Date(2023, 0, 1));
    component.onEndDateSelected(new Date(2023, 11, 31));

    component.loadYearlySales();

    const url = `${environment.apiBaseUrl}/reports/sales/sales-by-year?startYear=2023&endYear=2023`;
    const req = httpMock.expectOne(url);
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    expect(component.error).toBe('Failed to load yearly sales.');
    expect(component.chartData.length).toBe(0);
  });
});