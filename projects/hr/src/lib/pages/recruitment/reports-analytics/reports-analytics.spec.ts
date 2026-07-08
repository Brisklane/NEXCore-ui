import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsAnalytics } from './reports-analytics';

describe('ReportsAnalytics', () => {
  let component: ReportsAnalytics;
  let fixture: ComponentFixture<ReportsAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsAnalytics],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsAnalytics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
