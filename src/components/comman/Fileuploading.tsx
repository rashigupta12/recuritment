'use client'
import { frappeAPI } from '@/lib/api/frappeClient';
import { useState } from 'react';

const FileUploadComponent = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });
    
    // Reset states
    setUploading(true);
    setError(null);
    setUploadResult(null);
    setDebugInfo(null);

    try {
      console.log('🚀 Initiating upload...');
      
      // Upload without attaching to document (standalone file)
      const result = await frappeAPI.upload(file, {
        is_private: false,
        folder: 'Home'
      });

      console.log('📥 Upload result:', result);
      setDebugInfo(result);

      if (result.success) {
        console.log('✅ SUCCESS! File uploaded');
        setUploadResult({
          file_name: result.file_name,
          file_url: result.file_url,
          name: result.name,
          fullData: result.data
        });
      } else {
        console.error('❌ Upload failed:', result.error);
        setError(result.error || 'Upload failed - check console');
      }
    } catch (err) {
      console.error('💥 Upload exception:', err);
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setDebugInfo({ exception: err });
    } finally {
      setUploading(false);
      // Clear input
      event.target.value = '';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>File Upload Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          accept="*/*"
          style={{ padding: '10px', border: '1px solid #ccc' }}
        />
      </div>
      
      {uploading && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b',
          marginBottom: '10px'
        }}>
          ⏳ Uploading... Please wait
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444',
          marginBottom: '10px',
          color: '#991b1b'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {uploadResult && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d1fae5', 
          border: '1px solid #10b981',
          marginBottom: '10px',
          color: '#065f46'
        }}>
          <h3>✅ Upload Successful!</h3>
          <p><strong>File Name:</strong> {uploadResult.file_name}</p>
          <p><strong>File URL:</strong> <a href={uploadResult.file_url} target="_blank" rel="noopener noreferrer">{uploadResult.file_url}</a></p>
          {uploadResult.name && <p><strong>Document Name:</strong> {uploadResult.name}</p>}
        </div>
      )}

      {debugInfo && (
        <details style={{ 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #9ca3af'
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            🔍 Debug Info (Click to expand)
          </summary>
          <pre style={{ 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default FileUploadComponent;