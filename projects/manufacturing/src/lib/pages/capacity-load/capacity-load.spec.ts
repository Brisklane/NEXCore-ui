import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapacityLoad } from './capacity-load';
describe('CapacityLoad', () => {
  let c: CapacityLoad; let f: ComponentFixture<CapacityLoad>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [CapacityLoad], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(CapacityLoad); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
