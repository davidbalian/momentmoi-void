"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { ErrorBoundary, DefaultErrorFallback, DashboardErrorFallback, DataErrorFallback } from "@/components/ui/ErrorBoundary";
import { AlertCircle, AlertTriangle, Info, Bug } from "lucide-react";

// Test component that throws different types of errors
function ErrorTestComponent({ errorType }: { errorType: string }) {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    switch (errorType) {
      case 'network':
        throw new Error('Network connection failed. Unable to reach the server.');
      case 'auth':
        throw new Error('Authentication failed. Your session has expired.');
      case 'data':
        throw new Error('Database query failed. Unable to load data.');
      case 'permission':
        throw new Error('Permission denied. You do not have access to this resource.');
      case 'validation':
        throw new Error('Validation error. Invalid input provided.');
      default:
        throw new Error('Unknown error occurred.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Test: {errorType}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          This component will throw a {errorType} error when you click the button below.
        </p>
        <Button 
          onClick={() => setShouldThrow(true)}
          variant="destructive"
          size="sm"
        >
          Trigger {errorType} Error
        </Button>
      </CardContent>
    </Card>
  );
}

// Component that simulates different error scenarios
function ErrorSimulator() {
  const [simulatedError, setSimulatedError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'data' | 'permission' | 'validation'>('network');

  const simulateError = (type: typeof errorType) => {
    setErrorType(type);
    switch (type) {
      case 'network':
        setSimulatedError('Unable to connect to the server. Please check your internet connection and try again.');
        break;
      case 'auth':
        setSimulatedError('Your session has expired. Please log in again to continue.');
        break;
      case 'data':
        setSimulatedError('Unable to load or save data. Please try again or contact support if the problem persists.');
        break;
      case 'permission':
        setSimulatedError('You don\'t have permission to perform this action. Please contact support if you believe this is an error.');
        break;
      case 'validation':
        setSimulatedError('The provided data is invalid. Please check your input and try again.');
        break;
    }
  };

  const clearError = () => {
    setSimulatedError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => simulateError('network')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Network Error
              </Button>
              <Button 
                onClick={() => simulateError('auth')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Auth Error
              </Button>
              <Button 
                onClick={() => simulateError('data')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                Data Error
              </Button>
              <Button 
                onClick={() => simulateError('permission')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Permission Error
              </Button>
              <Button 
                onClick={() => simulateError('validation')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bug className="w-4 h-4" />
                Validation Error
              </Button>
            </div>
            
            {simulatedError && (
              <div className={`border rounded-lg p-4 ${
                errorType === 'network' 
                  ? 'bg-orange-50 border-orange-200' 
                  : errorType === 'auth'
                  ? 'bg-red-50 border-red-200'
                  : errorType === 'permission'
                  ? 'bg-red-50 border-red-200'
                  : errorType === 'validation'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  {errorType === 'network' ? (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  ) : errorType === 'auth' || errorType === 'permission' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : errorType === 'validation' ? (
                    <Bug className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      errorType === 'network' 
                        ? 'text-orange-800' 
                        : errorType === 'auth' || errorType === 'permission'
                        ? 'text-red-800'
                        : errorType === 'validation'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }`}>
                      {errorType === 'network' 
                        ? 'Connection Issue' 
                        : errorType === 'auth'
                        ? 'Authentication Error'
                        : errorType === 'permission'
                        ? 'Permission Error'
                        : errorType === 'validation'
                        ? 'Validation Error'
                        : 'Data Loading Issue'
                      }
                    </p>
                    <p className={`text-sm ${
                      errorType === 'network' 
                        ? 'text-orange-700' 
                        : errorType === 'auth' || errorType === 'permission'
                        ? 'text-red-700'
                        : errorType === 'validation'
                        ? 'text-yellow-700'
                        : 'text-blue-700'
                    }`}>
                      {simulatedError}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className={`${
                      errorType === 'network' 
                        ? 'text-orange-700 hover:text-orange-800' 
                        : errorType === 'auth' || errorType === 'permission'
                        ? 'text-red-700 hover:text-red-800'
                        : errorType === 'validation'
                        ? 'text-yellow-700 hover:text-yellow-800'
                        : 'text-blue-700 hover:text-blue-800'
                    }`}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorHandlingTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Error Handling Test Suite
          </h1>
          <p className="text-gray-600">
            Test the comprehensive error handling implementation for the vendor dashboard
          </p>
        </div>

        {/* Error Simulation */}
        <ErrorSimulator />

        {/* Error Boundary Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ErrorBoundary fallback={DefaultErrorFallback}>
            <ErrorTestComponent errorType="network" />
          </ErrorBoundary>

          <ErrorBoundary fallback={DefaultErrorFallback}>
            <ErrorTestComponent errorType="auth" />
          </ErrorBoundary>

          <ErrorBoundary fallback={DefaultErrorFallback}>
            <ErrorTestComponent errorType="data" />
          </ErrorBoundary>

          <ErrorBoundary fallback={DashboardErrorFallback}>
            <ErrorTestComponent errorType="permission" />
          </ErrorBoundary>

          <ErrorBoundary fallback={DataErrorFallback}>
            <ErrorTestComponent errorType="validation" />
          </ErrorBoundary>

          <ErrorBoundary fallback={DefaultErrorFallback}>
            <ErrorTestComponent errorType="unknown" />
          </ErrorBoundary>
        </div>

        {/* Error Handling Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Error Handling Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Error Types</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>Network:</strong> Connection issues, timeouts, server unavailable</li>
                  <li><strong>Authentication:</strong> Session expired, invalid tokens, login required</li>
                  <li><strong>Data:</strong> Database errors, query failures, data not found</li>
                  <li><strong>Permission:</strong> Access denied, insufficient privileges</li>
                  <li><strong>Validation:</strong> Invalid input, format errors, required fields</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Error Recovery</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>Retry Mechanism:</strong> Automatic retry with exponential backoff</li>
                  <li><strong>Error Boundaries:</strong> Isolated error handling per component</li>
                  <li><strong>User-Friendly Messages:</strong> Clear, actionable error messages</li>
                  <li><strong>Fallback UI:</strong> Graceful degradation when components fail</li>
                  <li><strong>Error Logging:</strong> Comprehensive error tracking and reporting</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Error Boundaries</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>DefaultErrorFallback:</strong> General error handling with retry</li>
                  <li><strong>DashboardErrorFallback:</strong> Dashboard-specific error handling</li>
                  <li><strong>DataErrorFallback:</strong> Data loading error handling</li>
                  <li><strong>ErrorFallback:</strong> Simple inline error display</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
