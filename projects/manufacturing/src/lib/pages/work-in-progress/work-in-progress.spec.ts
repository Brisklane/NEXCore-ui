import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkInProgress } from './work-in-progress';
describe('WorkInProgress', () => {
  let c: WorkInProgress; let f: ComponentFixture<WorkInProgress>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [WorkInProgress], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(WorkInProgress); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
