import { useState, useCallback } from 'react';
import { backgroundProcessor } from '../utils/backgroundProcessor';
import { validateImage, validateVideo } from '../utils/validation';
import { useErrorTracking } from './useErrorTracking';

type FileResult = { url: string; name: string; file: File };

export const useFileProcessor = () => {
  const [processing, setProcessing] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { trackValidationError, trackError } = useErrorTracking();

  const processImages = useCallback(async (
    files: File[],
    onComplete: (results: FileResult[]) => void
  ) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setProcessing(prev => prev + imageFiles.length);
    const results: FileResult[] = [];
    const errorList: string[] = [];

    for (const file of imageFiles) {
      try {
        await validateImage(file);
        
        backgroundProcessor.add({
          id: `${file.name}-${Date.now()}`,
          file,
          type: 'image',
          onComplete: (result) => {
            results.push(result);
            setProcessing(prev => prev - 1);
            
            if (results.length + errorList.length === imageFiles.length) {
              onComplete(results);
              if (errorList.length > 0) {
                setErrors(errorList);
                setTimeout(() => setErrors([]), 5000);
              }
            }
          },
          onError: (error) => {
            errorList.push(`${file.name}: ${error.message}`);
            trackError(`Image processing error: ${error.message}`, { file: file.name });
            setProcessing(prev => prev - 1);
          }
        });
      } catch (err) {
        const error = err as Error;
        errorList.push(`${file.name}: ${error.message}`);
        trackValidationError('image-validation', file, error.message);
        setProcessing(prev => prev - 1);
      }
    }
  }, [trackValidationError, trackError]);

  const processVideos = useCallback(async (
    files: File[],
    onComplete: (results: FileResult[]) => void
  ) => {
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    if (videoFiles.length === 0) return;

    setProcessing(prev => prev + videoFiles.length);
    const results: FileResult[] = [];
    const errorList: string[] = [];

    for (const file of videoFiles) {
      try {
        const validation = await validateVideo(file);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid video');
        }

        backgroundProcessor.add({
          id: `${file.name}-${Date.now()}`,
          file,
          type: 'video',
          onComplete: (result) => {
            results.push(result);
            setProcessing(prev => prev - 1);
            
            if (results.length + errorList.length === videoFiles.length) {
              onComplete(results);
              if (errorList.length > 0) {
                setErrors(errorList);
                setTimeout(() => setErrors([]), 5000);
              }
            }
          },
          onError: (error) => {
            errorList.push(`${file.name}: ${error.message}`);
            trackError(`Video processing error: ${error.message}`, { file: file.name });
            setProcessing(prev => prev - 1);
          }
        });
      } catch (err) {
        const error = err as Error;
        errorList.push(`${file.name}: ${error.message}`);
        trackValidationError('video-validation', file, error.message);
        setProcessing(prev => prev - 1);
      }
    }
  }, [trackValidationError, trackError]);

  return { processing, errors, processImages, processVideos };
};
