'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    price: '0',
    categoryId: '',
    downloadUrl: '',
    image: '',
    isDigital: true,
    fileFormat: 'ZIP',
    fileSize: '',
    templateType: '',
    compatibility: [],
    tags: [],
    featured: false,
    demoUrl: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Kategoriler için state
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);

        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Kategoriler yüklenirken bir hata oluştu');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Beklenmeyen API yanıtı:', data);
          setCategoriesError('Kategoriler yüklenirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        setCategoriesError(error instanceof Error ? error.message : 'Kategoriler yüklenirken bir hata oluştu');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Dosya boyutu 10MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setUploadError('Sadece JPEG, PNG ve GIF formatları desteklenmektedir');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('Dosya yükleme başlıyor...', {
        fileName: file.name,
        fileType: file.type,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'templates');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log('API yanıtı:', responseText);

      if (!response.ok) {
        throw new Error(`Dosya yükleme başarısız: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Geçersiz JSON yanıtı: ${responseText}`);
      }

      console.log('Yükleme başarılı:', data);
      setUploadedImage(data.url);
      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setUploadError(`Dosya yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImage) {
      setUploadError('Lütfen bir ürün görseli yükleyin');
      return;
    }

    try {
      console.log('Gönderilecek form verisi:', formData);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();
      console.log('API yanıtı:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Geçersiz API yanıtı: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Ürün ekleme başarısız');
      }

      alert('Ürün başarıyla eklendi!');

      // Formu sıfırla
      setFormData({
        name: '',
        description: '',
        details: '',
        price: '0',
        categoryId: '',
        downloadUrl: '',
        image: '',
        isDigital: true,
        fileFormat: 'ZIP',
        fileSize: '',
        templateType: '',
        compatibility: [],
        tags: [],
        featured: false,
        demoUrl: ''
      });
      setUploadedImage(null);

    } catch (error) {
      console.error('Ürün ekleme hatası:', error);

      // Hata mesajını al
      let errorMessage = 'Ürün eklenirken bir hata oluştu';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        // @ts-ignore
        errorMessage = error.error || errorMessage;
      }

      alert(`Ürün eklenirken bir hata oluştu: ${errorMessage}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
        <Link
          href="/admin/products"
          className="btn btn-neutral"
        >
          Geri Dön
        </Link>
      </div>

      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Ürün Adı
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Fiyat (TL)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
                Kategori
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={categoriesLoading}
                className="select select-bordered w-full"
              >
                <option value="">Kategori Seçin</option>
                {categoriesLoading ? (
                  <option value="" disabled>Kategoriler yükleniyor...</option>
                ) : categoriesError ? (
                  <option value="" disabled>Hata: {categoriesError}</option>
                ) : categories.length === 0 ? (
                  <option value="" disabled>Kategori bulunamadı</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="templateType" className="block text-sm font-medium mb-1">
                Şablon Türü
              </label>
              <select
                id="templateType"
                name="templateType"
                value={formData.templateType}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Şablon Türü Seçin</option>
                <option value="Wix">Wix</option>
                <option value="Framer">Framer</option>
                <option value="Next.js">Next.js</option>
                <option value="WordPress">WordPress</option>
                <option value="Canva">Canva</option>
                <option value="Other">Diğer</option>
              </select>
            </div>

            <div>
              <label htmlFor="fileFormat" className="block text-sm font-medium mb-1">
                Dosya Formatı
              </label>
              <select
                id="fileFormat"
                name="fileFormat"
                value={formData.fileFormat}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="ZIP">ZIP</option>
                <option value="PDF">PDF</option>
                <option value="PSD">PSD</option>
                <option value="AI">AI</option>
                <option value="SKETCH">SKETCH</option>
                <option value="FIG">FIG</option>
                <option value="XD">XD</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="JS">JS</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label htmlFor="fileSize" className="block text-sm font-medium mb-1">
                Dosya Boyutu
              </label>
              <input
                type="text"
                id="fileSize"
                name="fileSize"
                value={formData.fileSize}
                onChange={handleChange}
                placeholder="Örn: 15MB"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label htmlFor="downloadUrl" className="block text-sm font-medium mb-1">
                İndirme Linki
              </label>
              <input
                type="text"
                id="downloadUrl"
                name="downloadUrl"
                value={formData.downloadUrl}
                onChange={handleChange}
                required
                placeholder="https://example.com/download"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label htmlFor="demoUrl" className="block text-sm font-medium mb-1">
                Demo Linki
              </label>
              <input
                type="text"
                id="demoUrl"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleChange}
                placeholder="https://example.com/demo"
                className="input input-bordered w-full"
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="checkbox checkbox-primary"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Öne Çıkan Ürün
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Ürün Açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-medium mb-1">
              Detaylı Açıklama
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={5}
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Etiketler (virgülle ayırın)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                setFormData({...formData, tags: tagsArray});
              }}
              placeholder="örn: şablon, web sitesi, modern"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label htmlFor="compatibility" className="block text-sm font-medium mb-1">
              Uyumluluk (virgülle ayırın)
            </label>
            <input
              type="text"
              id="compatibility"
              name="compatibility"
              value={Array.isArray(formData.compatibility) ? formData.compatibility.join(', ') : ''}
              onChange={(e) => {
                const compatibilityArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                setFormData({...formData, compatibility: compatibilityArray});
              }}
              placeholder="örn: Wix, Editor X, Responsive"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ürün Görseli
            </label>

            {uploadedImage ? (
              <div className="mt-2 relative">
                <Image
                  src={uploadedImage}
                  alt="Yüklenen görsel"
                  width={300}
                  height={200}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                        >
                          <span>Dosya yükle</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileUpload}
                            accept="image/jpeg,image/png,image/gif"
                          />
                        </label>
                        <p className="pl-1">veya sürükle bırak</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF max 10MB</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Ürünü Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
