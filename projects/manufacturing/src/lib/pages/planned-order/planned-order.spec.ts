import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannedOrder } from './planned-order';
describe('PlannedOrder', () => {
  let c: PlannedOrder; let f: ComponentFixture<PlannedOrder>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [PlannedOrder], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(PlannedOrder); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
