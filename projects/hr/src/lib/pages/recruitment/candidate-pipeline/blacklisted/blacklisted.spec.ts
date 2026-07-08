import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Blacklisted } from './blacklisted';

describe('Blacklisted', () => {
  let component: Blacklisted;
  let fixture: ComponentFixture<Blacklisted>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blacklisted],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Blacklisted);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
