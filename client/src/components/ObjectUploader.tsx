import { useState, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method?: "PUT";
    url?: string;
    uploadURL?: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string; type?: string; name: string; size?: number }> }) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary";
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "outline",
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${formatFileSize(maxFileSize)}. Your file is ${formatFileSize(file.size)}.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload ${maxNumberOfFiles} file${maxNumberOfFiles > 1 ? 's' : ''} at a time.`,
        variant: "destructive",
      });
      return;
    }
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await onGetUploadParameters();
      const uploadURL = response.url || response.uploadURL;

      if (!uploadURL) {
        throw new Error("No upload URL received from server");
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", selectedFile.type || "application/octet-stream");
        xhr.send(selectedFile);
      });

      onComplete?.({
        successful: [{
          uploadURL: uploadURL.split("?")[0],
          type: selectedFile.type || "application/octet-stream",
          name: selectedFile.name,
          size: selectedFile.size,
        }],
      });

      toast({
        title: "Upload successful",
        description: "Your file has been uploaded.",
      });

      setShowModal(false);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <Button
        onClick={() => setShowModal(true)}
        className={buttonClassName}
        variant={buttonVariant}
        type="button"
        data-testid="button-upload-file"
      >
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={maxNumberOfFiles > 1}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > maxNumberOfFiles) {
                      toast({
                        title: "Too many files",
                        description: `You can only upload ${maxNumberOfFiles} file${maxNumberOfFiles > 1 ? 's' : ''} at a time.`,
                        variant: "destructive",
                      });
                      return;
                    }
                    const file = files[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                  data-testid="input-file"
                />

                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-browse-files"
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  {!uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      data-testid="button-remove-file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFile(null);
                      setUploadProgress(0);
                    }}
                    disabled={uploading}
                    className="flex-1"
                    data-testid="button-cancel-upload"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadFile}
                    disabled={uploading}
                    className="flex-1"
                    data-testid="button-confirm-upload"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
