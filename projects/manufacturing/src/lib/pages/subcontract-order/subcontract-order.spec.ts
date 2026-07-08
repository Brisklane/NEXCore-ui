import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcontractOrder } from './subcontract-order';
describe('SubcontractOrder', () => {
  let c: SubcontractOrder; let f: ComponentFixture<SubcontractOrder>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [SubcontractOrder], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(SubcontractOrder); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
