import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contract } from './contract';

describe('Contract', () => {
  let component: Contract;
  let fixture: ComponentFixture<Contract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contract],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Contract);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
