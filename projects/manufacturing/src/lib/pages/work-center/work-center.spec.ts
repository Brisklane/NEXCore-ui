import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkCenter } from './work-center';

describe('WorkCenter', () => {
  let component: WorkCenter;
  let fixture: ComponentFixture<WorkCenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WorkCenter], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents();
    fixture = TestBed.createComponent(WorkCenter);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());
});
