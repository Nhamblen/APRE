import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-feedback-by-region',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Customer Feedback by Region</h1>

    <!-- Loading indicator -->
    @if (loading) {
      <p>Loading...</p>
    }

    <!-- Display error message if one exists -->
    @if (errorMessage) {
      <div class="message message--error">{{ errorMessage }}</div>
    }

    <!-- Loop through each region returned from the API -->
    @for (region of data; track region.region) {
      <h2>{{ region.region }} (Average Rating: {{ region.averageRating }})</h2>

      <!-- Table showing feedback details for the region -->
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Feedback Type</th>
            <th>Rating</th>
            <th>Feedback</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loop through each feedback record for the region -->
          @for (item of region.feedback; track item.feedbackText) {
            <tr>
              <td>{{ item.product }}</td>
              <td>{{ item.feedbackType }}</td>
              <td>{{ item.rating }}</td>
              <td>{{ item.feedbackText }}</td>
            </tr>
          }
        </tbody>
      </table>

      <hr>
    }
  `,
  styles: [`
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .table th,
    .table td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }

    h2 {
      margin-top: 30px;
    }

    .message--error {
      color: #b30000;
      background: #ffe5e5;
      padding: 10px;
      border: 1px solid #b30000;
      margin-bottom: 20px;
      border-radius: 4px;
    }
  `]
})
export class CustomerFeedbackByRegionComponent {
  // Stores the API response (list of regions + feedback details)
  data: any[] = [];

  // Holds an error message to display to the user
  errorMessage = '';

  // Controls loading indicator
  loading = true;

  constructor(private http: HttpClient) {}

   /**
   * Automatically runs when the component initializes.
   * Sends a GET request to fetch customer feedback data
   * grouped by region.
   */
  ngOnInit() {
    this.http.get(`${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-region`)
      .subscribe({
        // Handle successful API response
        next: res => {
          this.data = res as any[];
          this.loading = false;

          // If no data returned, show friendly error message
          if (!this.data.length) {
            this.errorMessage = 'No customer feedback data found.';
          }
        },

        // Handle any network or server errors
        error: () => {
          this.errorMessage = 'Error fetching customer feedback.';
          this.loading = false;
        }
      });
  }
}