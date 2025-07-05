import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCamera, HiOutlineTrash, HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import { AvatarService } from '../services/avatarService';
import { useToast } from '../../../context/ToastContext';

interface AvatarUploadProps {
  studentId: string;
  currentAvatarUrl?: string | null;
  studentName: string;
  onUploadComplete: (avatarUrl: string) => void;
  onDeleteComplete: () => void;
}

export function AvatarUpload({ 
  studentId, 
  currentAvatarUrl, 
  studentName,
  onUploadComplete,
  onDeleteComplete
}: AvatarUploadProps) {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const getCroppedImage = async (): Promise<Blob> => {
    if (!imgRef.current || !completedCrop || !selectedFile) {
      throw new Error('Crop not completed');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        selectedFile.type,
        0.9
      );
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !completedCrop) return;

    setIsUploading(true);
    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImage();
      
      // Create a new file from the blob
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: selectedFile.type
      });

      // Resize if needed (max 400x400 for avatars)
      const resizedBlob = await AvatarService.resizeImage(croppedFile, 400, 400);
      const finalFile = new File([resizedBlob], selectedFile.name, {
        type: selectedFile.type
      });

      // Upload
      const avatarUrl = await AvatarService.uploadAvatar(studentId, finalFile);
      
      showToast('Avatar uploaded successfully!', 'success');
      onUploadComplete(avatarUrl);
      
      // Reset state
      setShowCropModal(false);
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to upload avatar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;

    if (!confirm('Are you sure you want to remove this avatar?')) return;

    setIsUploading(true);
    try {
      await AvatarService.deleteAvatar(studentId);
      showToast('Avatar removed successfully', 'success');
      onDeleteComplete();
    } catch (error: any) {
      showToast(error.message || 'Failed to remove avatar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar Display */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {currentAvatarUrl ? (
              <img 
                src={currentAvatarUrl} 
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-medium text-gray-400 dark:text-gray-500">
                {getInitials(studentName)}
              </span>
            )}
          </div>
          
          {/* Upload/Delete Button */}
          <div className="absolute -bottom-2 -right-2 flex space-x-1">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isUploading}
                className="p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <HiOutlineCamera className="w-5 h-5" />
              </motion.button>
            </div>
            
            {currentAvatarUrl && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isUploading}
                className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Drag & Drop Zone (Alternative) */}
        <div 
          {...getRootProps()} 
          className={`
            w-full max-w-xs border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <HiOutlineUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? 'Drop the image here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Max 5MB • JPEG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCropModal(false);
              setSelectedImage(null);
              setSelectedFile(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Crop Avatar Image
                </h3>
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedImage(null);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Crop Area */}
              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="max-w-full mx-auto">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={selectedImage}
                      alt="Crop preview"
                      className="max-w-full"
                    />
                  </ReactCrop>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedImage(null);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !completedCrop}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineUpload className="w-4 h-4" />
                      <span>Upload Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}