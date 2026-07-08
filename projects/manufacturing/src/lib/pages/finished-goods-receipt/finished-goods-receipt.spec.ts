import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinishedGoodsReceipt } from './finished-goods-receipt';
describe('FinishedGoodsReceipt', () => {
  let c: FinishedGoodsReceipt; let f: ComponentFixture<FinishedGoodsReceipt>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [FinishedGoodsReceipt], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(FinishedGoodsReceipt); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
