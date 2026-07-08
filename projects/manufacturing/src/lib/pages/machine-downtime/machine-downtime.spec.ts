import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MachineDowntime } from './machine-downtime';
describe('MachineDowntime', () => {
  let c: MachineDowntime; let f: ComponentFixture<MachineDowntime>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [MachineDowntime], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(MachineDowntime); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
