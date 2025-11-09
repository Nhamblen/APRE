import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPerformanceBySupervisorComponent } from './agent-performance-by-supervisor.component';

describe('AgentPerformanceBySupervisorComponent', () => {
  let component: AgentPerformanceBySupervisorComponent;
  let fixture: ComponentFixture<AgentPerformanceBySupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPerformanceBySupervisorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPerformanceBySupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
