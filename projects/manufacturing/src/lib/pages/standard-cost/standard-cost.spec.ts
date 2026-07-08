import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandardCost } from './standard-cost';
describe('StandardCost', () => {
  let c: StandardCost; let f: ComponentFixture<StandardCost>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [StandardCost], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(StandardCost); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
