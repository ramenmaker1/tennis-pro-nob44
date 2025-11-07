import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <Card className="max-w-2xl w-full shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Something went wrong
                  </h1>
                  <p className="text-slate-600 mb-4">
                    We encountered an unexpected error. This has been logged and we'll look into it.
                  </p>
                  
                  {this.state.error && (
                    <details className="mb-6">
                      <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900 mb-2">
                        Error Details (for developers)
                      </summary>
                      <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 overflow-auto max-h-64">
                        <div className="text-sm font-mono text-red-600 mb-2">
                          {this.state.error.toString()}
                        </div>
                        {this.state.errorInfo && (
                          <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        )}
                      </div>
                    </details>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={this.handleReset}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Link to={createPageUrl("Dashboard")}>
                      <Button variant="outline">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;