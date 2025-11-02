/** Major development task - client tests 11/2/25a
 *
 * Create an API to fetchl yearly sales data and build an Angular component to display
 * yearly sales using ChartComponent or TableComponent with 3 unit tests each.
 *
 * Implement the API to fetch yearly sales data and create a component to display
 * the data using either ChartComponent or TableComponent. Ensure both have 3 unit tests.
 *
 */


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesByYearComponent } from './sales-by-year.component';
import { SalesService } from '../../services/sales.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SalesByYearComponent', () => {
  let component: SalesByYearComponent;
  let fixture: ComponentFixture<SalesByYearComponent>;
  let salesServiceSpy: jasmine.SpyObj<SalesService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SalesService', ['getSalesByYear']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule],
      declarations: [SalesByYearComponent],
      providers: [{ provide: SalesService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesByYearComponent);
    component = fixture.componentInstance;
    salesServiceSpy = TestBed.inject(SalesService) as jasmine.SpyObj<SalesService>;
  });

  it('loads yearly sales on init', () => {
    salesServiceSpy.getSalesByYear.and.returnValue(of([
      { year: 2023, totalSales: 100, count: 2 }
    ]));

    fixture.detectChanges();
    expect(component.rows.length).toBe(1);
  });

  it('shows empty state if no sales exist', () => {
    salesServiceSpy.getSalesByYear.and.returnValue(of([]));
    fixture.detectChanges();

    expect(component.rows.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No data found');
  });

  it('handles service error gracefully', () => {
    salesServiceSpy.getSalesByYear.and.returnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    expect(component.error).toBe('Failed to load yearly sales.');
  });
});