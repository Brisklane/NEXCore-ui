import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryTransaction } from './inventory-transaction';
describe('InventoryTransaction', () => {
  let c: InventoryTransaction; let f: ComponentFixture<InventoryTransaction>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [InventoryTransaction], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(InventoryTransaction); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
