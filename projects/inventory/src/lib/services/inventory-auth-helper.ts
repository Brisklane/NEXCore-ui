import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InventoryAuthHelper {
  getToken(): string | null {
    return (
      localStorage.getItem('erp_token') ||
      sessionStorage.getItem('erp_token')
    );
  }

  getAuthHeaders(): { Authorization: string } | Record<string, never> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
