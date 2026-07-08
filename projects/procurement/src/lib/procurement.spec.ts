import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Procurement } from './procurement';

describe('Procurement', () => {
  let component: Procurement;
  let fixture: ComponentFixture<Procurement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Procurement],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Procurement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
