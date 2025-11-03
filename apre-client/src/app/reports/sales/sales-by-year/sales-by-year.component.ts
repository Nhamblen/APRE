/** Major development task - client 11/2/25
 *
 * Create an API to fetch yearly sales data and build an Angular component to display
 * yearly sales using ChartComponent or TableComponent with 3 unit tests each.
 *
 * Implement the API to fetch yearly sales data and create a component to display
 * the data using either ChartComponent or TableComponent. Ensure both have 3 unit tests.
 *
 * I inserted more data into MongoDB in order to display the charts correctly

use apre;

db.sales.insertMany([
  { amount: 200, saleDate: new Date("2023-01-15"), region: "North", salesperson: "John" },
  { amount: 150, saleDate: new Date("2023-09-18"), region: "South", salesperson: "Sarah" },
  { amount: 500, saleDate: new Date("2024-04-03"), region: "East", salesperson: "Mike" },
  { amount: 800, saleDate: new Date("2024-08-12"), region: "North", salesperson: "John" }
]);


 * I also ran into an issue where I couldn't get the data to show, but just needed to restart the server
 */

import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { CalendarComponent } from '../../../shared/calendar/calendar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-by-year',
  standalone: true,
  imports: [CommonModule, ChartComponent, CalendarComponent],
  template: `
    <h1>Sales by Year</h1>

    <div class="calendar-form">
      <div class="calendar-form__group">
        <div class="calendar-form__item">
          <label class="calendar-form__label">Start Date:</label>
          <app-calendar (dateSelected)="onStartDateSelected($event)"></app-calendar>
        </div>

        <div class="calendar-form__item">
          <label class="calendar-form__label">End Date:</label>
          <app-calendar (dateSelected)="onEndDateSelected($event)"></app-calendar>
        </div>
      </div>
    </div>

    <button class="button button--primary"
            (click)="loadYearlySales()"
            [disabled]="!startDate || !endDate">
      Submit
    </button>

    <!-- Error Message -->
    <p *ngIf="error" class="error">{{ error }}</p>

    <!-- Chart -->
    <div *ngIf="chartData.length > 0" class="charts-container">
      <div class="card">
        <app-chart
          [type]="'bar'"
          [label]="'Sales By Year'"
          [data]="chartData"
          [labels]="chartLabels">
        </app-chart>
      </div>
    </div>

    <!-- No Data -->
    <p *ngIf="!error && !loading && chartData.length === 0 && startDate && endDate">
      No data found
    </p>
  `,
  styles: [`
    .calendar-form { width: 60%; margin: auto; }
    .calendar-form__group { display: flex; justify-content: space-between; }
    .calendar-form__item { flex: 1; margin: 0 10px; }
  `]
})
export class SalesByYearComponent {

  startDate: Date | null = null;
  endDate: Date | null = null;
  chartData: number[] = [];
  chartLabels: string[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  onStartDateSelected(date: Date) {
    this.startDate = date;
  }

  onEndDateSelected(date: Date) {
    this.endDate = date;
  }

  loadYearlySales() {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;
    this.error = null;

    const startYear = this.startDate?.getFullYear();
    const endYear = this.endDate?.getFullYear();

    const url = `${environment.apiBaseUrl}/reports/sales/sales-by-year?startYear=${startYear}&endYear=${endYear}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const filtered = data.filter(d => d.year !== null);

        this.chartData = filtered.map(d => d.totalSales);
        this.chartLabels = filtered.map(d => d.year.toString());

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load yearly sales.';
        this.loading = false;
      }
    });
  }
}