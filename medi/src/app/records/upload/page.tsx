'use client';
import React, { useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Shield, LockKeyhole, CheckCircle, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const recordTypes = [
  { value: 'lab', label: 'Laboratory Results', icon: '🧪' },
  { value: 'radiology', label: 'Radiology Images', icon: '📷' },
  { value: 'consultation', label: 'Consultation Notes', icon: '📝' },
  { value: 'prescription', label: 'Prescription', icon: '💊' },
  { value: 'surgery', label: 'Surgical Report', icon: '🩺' },
  { value: 'other', label: 'Other', icon: '📄' }
];

export default function UploadRecordPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3>(1);
  
  // Form state
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const validateStep = () => {
    if (uploadStep === 1) {
      if (!title.trim()) {
        toast.error("Please enter a record title");
        return false;
      }
      if (!recordType) {
        toast.error("Please select a record type");
        return false;
      }
      if (!date) {
        toast.error("Please enter a record date");
        return false;
      }
    } else if (uploadStep === 2) {
      if (!file) {
        setUploadError("Please select a file to upload");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    if (uploadStep < 3) {
      setUploadStep((prev) => (prev === 1 ? 2 : 3) as 1 | 2 | 3);
      return;
    }

    // Final submission
    setIsUploading(true);
    
    // Simulate API upload
    setTimeout(() => {
      toast.success("Record uploaded successfully!");
      setIsUploading(false);
      router.push('/records');
    }, 2000);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-70"></div>
        <div className="absolute bottom-1/3 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl opacity-40"></div>
      </div>
      
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="pl-0 pr-4 gap-1 text-gray-400 hover:text-white">
          <Link href="/records">
            <ArrowLeft className="h-4 w-4" />
            Back to Records
          </Link>
        </Button>
        
        <div className="ml-auto text-sm text-gray-500">
          Step {uploadStep} of 3
        </div>
      </div>

      <Card className="border-gray-800 shadow-xl bg-black/40 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-black">
          <CardTitle className="text-2xl text-white">Upload Medical Record</CardTitle>
          <CardDescription className="text-gray-400">
            Securely store your medical records with end-to-end encryption
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 pb-4">
          <div className="flex mb-10 relative">
            <div className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                uploadStep >= 1 
                  ? "bg-primary text-white shadow-md shadow-primary/30" 
                  : "bg-gray-800 text-gray-500"
              )}>
                {uploadStep > 1 ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-sm mt-2 transition-colors",
                uploadStep >= 1 ? "text-white font-medium" : "text-gray-500"
              )}>Record Details</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                uploadStep >= 2 
                  ? "bg-primary text-white shadow-md shadow-primary/30" 
                  : "bg-gray-800 text-gray-500"
              )}>
                {uploadStep > 2 ? <CheckCircle className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-sm mt-2 transition-colors",
                uploadStep >= 2 ? "text-white font-medium" : "text-gray-500"
              )}>Upload File</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                uploadStep >= 3 
                  ? "bg-primary text-white shadow-md shadow-primary/30" 
                  : "bg-gray-800 text-gray-500"
              )}>
                <Shield className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-sm mt-2 transition-colors",
                uploadStep >= 3 ? "text-white font-medium" : "text-gray-500"
              )}>Encrypt & Confirm</span>
            </div>
            
            {/* Progress bar connecting steps */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-800 -z-10"></div>
            <div 
              className="absolute top-5 left-[10%] h-0.5 bg-primary transition-all duration-500 -z-10" 
              style={{ 
                width: uploadStep === 1 ? '0%' : uploadStep === 2 ? '50%' : '100%'
              }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {uploadStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-400">Record Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g., Annual Physical Examination" 
                    className="bg-gray-900/70 border-gray-700 focus:border-primary focus:ring-primary/40"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-400">Record Type</Label>
                  <Select value={recordType} onValueChange={setRecordType} required>
                    <SelectTrigger className="bg-gray-900/70 border-gray-700 focus:ring-primary/40">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="focus:bg-primary/20">
                          <div className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-400">Record Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="bg-gray-900/70 border-gray-700 focus:border-primary focus:ring-primary/40"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-400">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Add any additional details about this record"
                    className="bg-gray-900/70 border-gray-700 focus:border-primary focus:ring-primary/40"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {uploadStep === 2 && (
              <div className="space-y-6">
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center transition-all",
                  uploadError ? "border-red-500/50 bg-red-500/5" : "border-gray-700/40 hover:border-primary/50"
                )}>
                  <div className="flex flex-col items-center">
                    {file ? (
                      <>
                        <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 text-primary">
                          <FileText className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium mb-1 text-white">
                          {file.name}
                        </h3>
                        <p className="text-sm text-primary mb-4">
                          File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-full bg-gray-800/80 flex items-center justify-center mb-4 text-gray-400">
                          <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium mb-1 text-white">
                          Drag & Drop your file here
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          PDF, JPEG, PNG or DICOM files up to 50MB
                        </p>
                      </>
                    )}
                    
                    {uploadError && (
                      <div className="mb-4 flex items-center justify-center text-red-400 gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{uploadError}</span>
                      </div>
                    )}
                    
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className={cn(
                        "px-4 py-2 rounded-md transition-all hover:opacity-90 flex items-center gap-2",
                        file ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-primary text-primary-foreground"
                      )}>
                        {file ? (
                          <>
                            <X className="h-4 w-4" />
                            Change File
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Select File
                          </>
                        )}
                      </div>
                      <Input 
                        id="file-upload" 
                        type="file" 
                        onChange={handleFileChange} 
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.dcm"
                      />
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/30 p-4 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <h4 className="text-sm font-medium text-white">End-to-End Encrypted</h4>
                  </div>
                  <div className="bg-gray-900/30 p-4 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <h4 className="text-sm font-medium text-white">HIPAA Compliant</h4>
                  </div>
                  <div className="bg-gray-900/30 p-4 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <h4 className="text-sm font-medium text-white">Blockchain Secured</h4>
                  </div>
                </div>
              </div>
            )}

            {uploadStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800/50">
                  <h3 className="font-medium mb-3 text-white flex items-center">
                    <LockKeyhole className="h-5 w-5 text-primary mr-2" />
                    Encryption Settings
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Your file will be encrypted with your wallet key, ensuring only you can access it.
                  </p>
                  
                  <div className="border rounded-lg p-4 bg-black/30 border-gray-800">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white">End-to-End Encrypted</h4>
                        <p className="text-sm text-gray-400">
                          Your files are encrypted before upload and can only be decrypted with your keys.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/40 p-5 rounded-lg border border-gray-800/50">
                  <h3 className="font-medium mb-4 text-white">Record Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-gray-400">Title:</div>
                    <div className="text-white font-medium">{title}</div>
                    
                    <div className="text-gray-400">Type:</div>
                    <div className="text-white font-medium">
                      {recordType && (
                        <div className="flex items-center">
                          <span className="mr-2">{recordTypes.find(t => t.value === recordType)?.icon}</span>
                          {recordTypes.find(t => t.value === recordType)?.label || recordType}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-gray-400">Date:</div>
                    <div className="text-white font-medium">{date}</div>
                    
                    {file && (
                      <>
                        <div className="text-gray-400">File:</div>
                        <div className="text-white font-medium truncate">{file.name}</div>
                        
                        <div className="text-gray-400">Size:</div>
                        <div className="text-white font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </>
                    )}
                    
                    {description && (
                      <>
                        <div className="text-gray-400">Description:</div>
                        <div className="text-white font-medium">{description}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-gray-800/50 py-4">
          {uploadStep > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setUploadStep(prev => (prev === 3 ? 2 : 1) as 1 | 2 | 3)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button type="button" variant="outline" asChild className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              <Link href="/records">Cancel</Link>
            </Button>
          )}
          
          <Button 
            onClick={handleSubmit}
            disabled={isUploading}
            className={cn(
              "min-w-[120px]",
              uploadStep === 3 ? "bg-gradient-to-r from-primary to-primary/90" : ""
            )}
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Uploading...
              </>
            ) : uploadStep === 3 ? (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Encrypt & Upload
              </>
            ) : (
              <>
                Continue
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 