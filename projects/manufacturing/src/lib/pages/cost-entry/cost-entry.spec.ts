import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CostEntry } from './cost-entry';
describe('CostEntry', () => {
  let c: CostEntry; let f: ComponentFixture<CostEntry>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [CostEntry], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(CostEntry); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
