import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Info } from 'lucide-react';

/**
 * Deprecation Notice Component
 * Shows a banner directing users to the new consolidated interface
 */
export default function DeprecationNotice({ 
  newPage, 
  newPageName = 'new interface',
  message 
}) {
  return (
    <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/30 border-2">
      <Info className="h-5 w-5 text-yellow-500" />
      <AlertDescription className="ml-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-yellow-500 mb-1">
              This page has been consolidated into the new interface
            </p>
            <p className="text-sm text-gray-400">
              {message || `This legacy page is maintained for backward compatibility. For the best experience, use the ${newPageName}.`}
            </p>
          </div>
          {newPage && (
            <Link
              to={`/${newPage}`}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              Go to {newPageName}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
