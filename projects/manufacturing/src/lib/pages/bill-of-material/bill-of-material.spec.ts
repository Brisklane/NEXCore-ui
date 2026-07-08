import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillOfMaterial } from './bill-of-material';
describe('BillOfMaterial', () => {
  let component: BillOfMaterial;
  let fixture: ComponentFixture<BillOfMaterial>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [BillOfMaterial], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); fixture = TestBed.createComponent(BillOfMaterial); component = fixture.componentInstance; });
  it('should create', () => expect(component).toBeTruthy());
});
