import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Inspection } from './inspection';
describe('Inspection', () => {
  let c: Inspection; let f: ComponentFixture<Inspection>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [Inspection], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(Inspection); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
