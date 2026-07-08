import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverheadRule } from './overhead-rule';
describe('OverheadRule', () => {
  let c: OverheadRule; let f: ComponentFixture<OverheadRule>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [OverheadRule], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(OverheadRule); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
