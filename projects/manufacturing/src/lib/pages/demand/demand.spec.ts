import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Demand } from './demand';
describe('Demand', () => {
  let c: Demand; let f: ComponentFixture<Demand>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [Demand], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(Demand); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
