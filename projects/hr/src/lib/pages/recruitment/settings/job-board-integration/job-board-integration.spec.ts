import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobBoardIntegration } from './job-board-integration';

describe('JobBoardIntegration', () => {
  let component: JobBoardIntegration;
  let fixture: ComponentFixture<JobBoardIntegration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobBoardIntegration],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobBoardIntegration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
