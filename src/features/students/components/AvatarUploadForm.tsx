import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCamera, HiOutlineTrash, HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import { useToast } from '../../../context/ToastContext';

interface AvatarUploadFormProps {
  onImageSelected: (file: File, croppedBlob: Blob) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string | null;
  studentName?: string;
}

export function AvatarUploadForm({ 
  onImageSelected, 
  onImageRemoved,
  currentImageUrl,
  studentName = 'Student'
}: AvatarUploadFormProps) {
  const { showToast } = useToast();
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
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
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

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

  const handleCropComplete = async () => {
    if (!selectedFile || !completedCrop) return;

    try {
      const croppedBlob = await getCroppedImage();
      
      // Create preview URL
      const url = URL.createObjectURL(croppedBlob);
      setPreviewUrl(url);
      
      // Pass to parent
      onImageSelected(selectedFile, croppedBlob);
      
      // Reset state
      setShowCropModal(false);
      setSelectedImage(null);
      setSelectedFile(null);
      
      showToast('Avatar ready to upload!', 'success');
    } catch (error: any) {
      showToast('Failed to crop image', 'error');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Avatar Photo
        </label>
        
        <div className="flex items-start space-x-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-gray-400 dark:text-gray-500">
                  {getInitials(studentName || 'S')}
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            {previewUrl && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="absolute -bottom-1 -right-1 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                <HiOutlineTrash className="w-3 h-3" />
              </motion.button>
            )}
          </div>

          {/* Upload Zone */}
          <div className="flex-1">
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <HiOutlineUpload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDragActive ? 'Drop the image here' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Max 5MB • JPEG, PNG, WebP
              </p>
            </div>
          </div>
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
                  onClick={handleCropComplete}
                  disabled={!completedCrop}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                  <HiOutlineCamera className="w-4 h-4" />
                  <span>Use This Photo</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}