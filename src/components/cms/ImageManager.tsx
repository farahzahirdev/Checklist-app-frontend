'use client';

import React, { useState, useEffect } from 'react';
import { CMSImage, getAllImages, uploadImage, deleteImage, updateImage } from '@/lib/api/cms-api';
import { toast } from 'sonner';
import { Trash2, Upload, Edit2 } from 'lucide-react';

export function ImageManager() {
  const [images, setImages] = useState<CMSImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await getAllImages();
      setImages(data.items);
    } catch (error) {
      toast.error('Failed to load images');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files?.length) return;

    const file = files[0];
    try {
      setUploading(true);
      const image = await uploadImage(file);
      setImages((prev) => [image, ...prev]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Failed to delete image');
      console.error(error);
    }
  };

  const handleUpdateAlt = async (imageId: string, altText: string) => {
    try {
      const updated = await updateImage(imageId, { alt_text: altText });
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? updated : img))
      );
      setEditingId(null);
      toast.success('Alt text updated');
    } catch (error) {
      toast.error('Failed to update alt text');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Image Manager</h2>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
        <label className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          <p className="font-medium">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No images yet. Upload one above.
          </div>
        ) : (
          images.map((image) => (
            <div
              key={image.id}
              className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={image.file_url || image.file_path}
                  alt={image.alt_text || image.filename}
                  className="w-full h-full object-cover"
                  onError={() => {
                    // Fallback for broken images
                  }}
                />
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium truncate" title={image.filename}>
                  {image.filename}
                </p>

                {/* Alt Text Editing */}
                {editingId === image.id ? (
                  <input
                    type="text"
                    value={editingAlt}
                    onChange={(e) => setEditingAlt(e.target.value)}
                    placeholder="Alt text"
                    autoFocus
                    className="w-full text-xs border px-2 py-1 rounded"
                  />
                ) : (
                  <p className="text-xs text-gray-500 truncate">
                    {image.alt_text || 'No alt text'}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {editingId === image.id ? (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateAlt(image.id, editingAlt)
                        }
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(image.id);
                          setEditingAlt(image.alt_text || '');
                        }}
                        className="flex-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Usage Info */}
                {image.used_in_pages?.page_ids?.length > 0 && (
                  <p className="text-xs text-green-600">
                    Used in {image.used_in_pages?.page_ids?.length} page(s)
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
