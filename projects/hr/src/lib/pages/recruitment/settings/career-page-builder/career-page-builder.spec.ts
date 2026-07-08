import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerPageBuilder } from './career-page-builder';

describe('CareerPageBuilder', () => {
  let component: CareerPageBuilder;
  let fixture: ComponentFixture<CareerPageBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerPageBuilder],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(CareerPageBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
