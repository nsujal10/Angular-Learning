import { Component, Injectable, Injector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EmployeeApiService } from './employee-api.service';
import { EmployeeStateService } from './employee-state.service';

@Component({
  selector: 'app-root-consumer-a',
  standalone: true,
  template: `<div>Root Consumer 1</div>`
})
class RootConsumerAComponent {
  readonly state = inject(EmployeeStateService);
}

@Component({
  selector: 'app-root-consumer-b',
  standalone: true,
  template: `<div>Root Consumer 2</div>`
})
class RootConsumerBComponent {
  readonly state = inject(EmployeeStateService);
}

@Component({
  selector: 'app-scoped-child',
  standalone: true,
  providers: [EmployeeStateService], // Isolated component-scoped provider!
  template: `<div>Scoped Component</div>`
})
class ScopedChildComponent {
  readonly state = inject(EmployeeStateService);
}

describe('Service Provider Scope Verification (Root Singleton vs Scoped Providers)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RootConsumerAComponent, RootConsumerBComponent, ScopedChildComponent],
      providers: [EmployeeApiService]
    });
  });

  it('should verify that EmployeeStateService is provided in root as a singleton across consumers', () => {
    const fixtureA = TestBed.createComponent(RootConsumerAComponent);
    const fixtureB = TestBed.createComponent(RootConsumerBComponent);

    const instanceFromA = fixtureA.componentInstance.state;
    const instanceFromB = fixtureB.componentInstance.state;
    const instanceFromRootTestBed = TestBed.inject(EmployeeStateService);

    // Verify same object reference identity across multiple consumer components
    expect(instanceFromA).toBe(instanceFromB);
    expect(instanceFromA).toBe(instanceFromRootTestBed);

    // Verify state mutation in one component reflects in the other (shared state)
    instanceFromA.setSearchTerm('Testing Singleton Scope');
    expect(instanceFromB.searchTerm()).toBe('Testing Singleton Scope');
    expect(instanceFromRootTestBed.searchTerm()).toBe('Testing Singleton Scope');
  });

  it('should verify that component-scoped providers create isolated instances', () => {
    const rootState = TestBed.inject(EmployeeStateService);
    const scopedFixture = TestBed.createComponent(ScopedChildComponent);
    const scopedState = scopedFixture.componentInstance.state;

    // Verify that the scoped instance is a distinct object reference
    expect(scopedState).not.toBe(rootState);

    // Verify state isolation: changing scoped state does not alter root state
    rootState.setSearchTerm('Root Search Query');
    scopedState.setSearchTerm('Isolated Child Query');

    expect(rootState.searchTerm()).toBe('Root Search Query');
    expect(scopedState.searchTerm()).toBe('Isolated Child Query');
  });

  it('should verify resolution through custom Child Injector hierarchy', () => {
    const parentInjector = TestBed.inject(Injector);
    const rootState = parentInjector.get(EmployeeStateService);

    // Create a child injector that provides its own EmployeeStateService
    const childInjector = Injector.create({
      providers: [
        { provide: EmployeeStateService, useClass: EmployeeStateService },
        { provide: EmployeeApiService, useValue: TestBed.inject(EmployeeApiService) }
      ],
      parent: parentInjector
    });

    const childState = childInjector.get(EmployeeStateService);

    expect(childState).toBeTruthy();
    expect(childState).not.toBe(rootState);
  });
});
