import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api.service';
import { simpleSyncService } from '../services/sync.service.simple';

export function SyncDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    online: navigator.onLine,
    token: localStorage.getItem('khs-crm-token') ? 'Present' : 'Missing',
    syncQueue: simpleSyncService.getPendingOperations(),
    lastError: null as any
  });

  // Force token creation if missing
  useEffect(() => {
    const token = localStorage.getItem('khs-crm-token');
    if (!token) {
      console.log('[SyncDiagnostics] No token found, creating mock token...');
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('khs-crm-token', mockToken);
      localStorage.setItem('khs-crm-user', JSON.stringify({
        id: 'dev-user',
        email: 'dev@khscrm.com',
        name: 'Development User',
        role: 'OWNER'
      }));
      setDiagnostics(prev => ({ ...prev, token: 'Present' }));
    }
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log('[SyncDiagnostics] Testing backend connection...');
        const response = await apiClient.get('/api/health');
        console.log('[SyncDiagnostics] Backend health check:', response);
        setDiagnostics(prev => ({ ...prev, lastError: null }));
      } catch (error) {
        console.error('[SyncDiagnostics] Backend connection failed:', error);
        setDiagnostics(prev => ({ ...prev, lastError: error }));
      }
    };

    checkBackend();
  }, []);

  const testCustomerFetch = async () => {
    try {
      console.log('[SyncDiagnostics] Fetching customers...');
      const customers = await apiClient.get('/api/customers');
      console.log('[SyncDiagnostics] Customers fetched:', customers);
      alert(`Fetched ${customers.length} customers from backend`);
    } catch (error) {
      console.error('[SyncDiagnostics] Customer fetch failed:', error);
      alert(`Failed to fetch customers: ${error}`);
    }
  };

  const testCustomerCreate = async () => {
    try {
      console.log('[SyncDiagnostics] Creating test customer...');
      const customer = await apiClient.post('/api/customers', {
        name: `Test Customer ${Date.now()}`,
        address: '123 Test St',
        phone: '555-0123'
      });
      console.log('[SyncDiagnostics] Customer created:', customer);
      alert(`Created customer: ${customer.name} (ID: ${customer.id})`);
    } catch (error) {
      console.error('[SyncDiagnostics] Customer create failed:', error);
      alert(`Failed to create customer: ${error}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Sync Diagnostics</h3>
      <div className="text-xs space-y-1">
        <div>API URL: {diagnostics.apiUrl}</div>
        <div>Online: {diagnostics.online ? '✅' : '❌'}</div>
        <div>Auth Token: {diagnostics.token}</div>
        <div>Queue Size: {diagnostics.syncQueue.length}</div>
        {diagnostics.lastError && (
          <div className="text-red-600">Error: {diagnostics.lastError.message}</div>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {diagnostics.token === 'Missing' && (
          <button
            onClick={() => {
              const mockToken = 'mock-token-' + Date.now();
              localStorage.setItem('khs-crm-token', mockToken);
              localStorage.setItem('khs-crm-user', JSON.stringify({
                id: 'dev-user',
                email: 'dev@khscrm.com',
                name: 'Development User',
                role: 'OWNER'
              }));
              setDiagnostics(prev => ({ ...prev, token: 'Present' }));
              window.location.reload();
            }}
            className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            🔧 Fix Missing Token
          </button>
        )}
        <button
          onClick={testCustomerFetch}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test Fetch Customers
        </button>
        <button
          onClick={testCustomerCreate}
          className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Test Create Customer
        </button>
      </div>
    </div>
  );
}