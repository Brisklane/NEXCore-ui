import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReworkOrder } from './rework-order';
describe('ReworkOrder', () => {
  let c: ReworkOrder; let f: ComponentFixture<ReworkOrder>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [ReworkOrder], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(ReworkOrder); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
