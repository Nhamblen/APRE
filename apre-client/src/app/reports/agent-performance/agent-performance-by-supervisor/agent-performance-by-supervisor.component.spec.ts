/**
 * Author: Noah Hamblen
 * Date: 11/8/25
 * File: agent-performance-by-supervisor.component.spec.ts
 * Description: Angular tests for AgentPerformanceBySupervisorComponent. Major development task M-086.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AgentPerformanceBySupervisorComponent } from './agent-performance-by-supervisor.component';

describe('AgentPerformanceBySupervisorComponent', () => {
  // Declare component and fixture variables used across all tests
  let component: AgentPerformanceBySupervisorComponent;
  let fixture: ComponentFixture<AgentPerformanceBySupervisorComponent>;

  /**
   * beforeEach() runs before every test so tests are fresh.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Import the component and HttpClientTestingModule for mock HTTP requests
      imports: [HttpClientTestingModule, AgentPerformanceBySupervisorComponent]
    }).compileComponents();

    // Create an instance of the component for testing
    fixture = TestBed.createComponent(AgentPerformanceBySupervisorComponent);
    component = fixture.componentInstance;

    // Trigger Angular’s initial change detection
    fixture.detectChanges();
  });

  // Test 1: Component should create successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Component instance should exist
  });

  // Test 2: Should display title correctly
  it('should display the title "Agent Performance by Supervisor"', () => {
    // Access the rendered HTML
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;

    // Locate the title element
    const titleElement = compiled.querySelector('h1');

    // Verify that <h1> exists and contains the expected text
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain('Agent Performance by Supervisor');
  });

  // Test 3: Should update selectedSupervisor when onSupervisorChange is called
  it('should update selectedSupervisor when onSupervisorChange is called', () => {
    // Call the method with a test value
    component.onSupervisorChange('Jane Smith');

    // Verify that the selectedSupervisor property now matches the input value
    expect(component.selectedSupervisor).toBe('Jane Smith');
  });
});
