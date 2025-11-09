/**
 * Author: Noah Hamblen
 * Date: 11/9/25
 * File: agent-performance-by-supervisor.component.ts
 * Description: Component to display agent performance by supervisor using a dropdown and table. Major development task M-086.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel on the <select>
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

// Interface describing one row of agent performance data
export interface AgentPerformanceRow {
  agent: string;
  totalCallDuration: number;
  avgResolutionTime: number;
}


@Component({
  selector: 'app-agent-performance-by-supervisor',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  template: `
    <div class="agent-perf-by-supervisor">
      <h1>Agent Performance by Supervisor</h1>

      <!-- Simple form row containing the supervisor dropdown and load button -->
      <div class="form-row">
        <label for="supervisorSelect">Supervisor</label>
<select
  id="supervisorSelect"
  [(ngModel)]="selectedSupervisor"
  (ngModelChange)="onSupervisorChange($event)"
>
  <option value="">Select a supervisor</option>
  <option *ngFor="let supervisor of supervisors" [value]="supervisor.id">
    {{ supervisor.name }}
  </option>
</select>

        <button type="button" (click)="loadData()">Load</button>
      </div>

      <!-- Error message for validation/server errors -->
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <!-- Simple loading indicator -->
      <p *ngIf="isLoading">Loading...</p>

<table class="table" *ngIf="rows.length">
  <thead>
    <tr>
      <th>Agent</th>
      <th>Total Call Duration</th>
      <th>Average Resolution Time</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let row of rows">
      <td>{{ row.agent }}</td>
      <td>{{ row.totalCallDuration }}</td>
      <td>{{ row.avgResolutionTime | number: '1.0-2' }}</td>
    </tr>
  </tbody>
</table>

    </div>
  `,
  styles: [
    `
      .agent-perf-by-supervisor {
        padding: 1rem;
      }

      .form-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .form-row label {
        font-weight: 600;
      }

      select {
        padding: 0.25rem 0.5rem;
      }

      button {
        padding: 0.25rem 0.75rem;
        cursor: pointer;
      }

      .error {
        color: #c0392b;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
    `
  ]
})
export class AgentPerformanceBySupervisorComponent {
  // List of supervisors with their corresponding ObjectIds (made up supervisor names)
supervisors = [
  { id: '650c1f1e1c9d440000a1b1c3', name: 'John Doe' },
  { id: '650c1f1e1c9d440000a1b1c4', name: 'Jane Smith' },
];

  // The currently selected supervisor name
  selectedSupervisor = '';

  // Table rows bound to the TableComponent
  rows: AgentPerformanceRow[] = [];

  // UI state flags and error message text
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {
    // HttpClient is injected so we can call the API
  }

  // Called whenever the dropdown value changes
  onSupervisorChange(supervisor: string): void {
    this.selectedSupervisor = supervisor;
    this.errorMessage = '';
    this.rows = []; // Clear old data when a new supervisor is selected
  }

  // Make the HTTP request to load data for the selected supervisor
  loadData(): void {
    if (!this.selectedSupervisor) {
      // Basic client-side validation for dropdown
      this.errorMessage = 'Please select a supervisor.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

const url = `${environment.apiBaseUrl}/reports/agent-performance/agent-performance-by-supervisor`;
const fullUrl = `${url}?supervisorId=${encodeURIComponent(
  this.selectedSupervisor
)}`;

    this.http.get<AgentPerformanceRow[]>(fullUrl).subscribe({
      next: (data) => {
        // On success, bind the returned rows into the table
        this.rows = data;
      },
      error: (err) => {
        // Log and show a friendly error message
        console.error('Error fetching agent performance by supervisor', err);
        this.errorMessage =
          'Unable to load agent performance data. Please try again.';
      },
      complete: () => {
        // Always clear loading indicator when the request finishes
        this.isLoading = false;
      }
    });
  }
}