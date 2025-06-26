'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function UiDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DaisyUI Bileşen Demosu</h1>
        <p className="text-gray-600">
          Bu sayfa DaisyUI ve Tailwind CSS ile oluşturulmuş UI bileşenlerini göstermektedir.
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-lifted mb-8">
        <a role="tab" className="tab tab-active">Butonlar</a>
        <a role="tab" className="tab">Kartlar</a>
        <a role="tab" className="tab">Uyarılar</a>
        <a role="tab" className="tab">Diğer Bileşenler</a>
      </div>

      {/* Butonlar Bölümü */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Butonlar</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Buton Varyantları</h3>
              <div className="flex flex-wrap gap-2 my-4">
                <button className="btn">Normal</button>
                <button className="btn btn-primary">Birincil</button>
                <button className="btn btn-secondary">İkincil</button>
                <button className="btn btn-accent">Vurgu</button>
                <button className="btn btn-info">Bilgi</button>
                <button className="btn btn-success">Başarılı</button>
                <button className="btn btn-warning">Uyarı</button>
                <button className="btn btn-error">Hata</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Buton Boyutları</h3>
              <div className="flex flex-wrap items-center gap-2 my-4">
                <button className="btn btn-xs">Çok Küçük</button>
                <button className="btn btn-sm">Küçük</button>
                <button className="btn">Normal</button>
                <button className="btn btn-lg">Büyük</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Çerçeveli Butonlar</h3>
              <div className="flex flex-wrap gap-2 my-4">
                <button className="btn btn-outline">Normal</button>
                <button className="btn btn-outline btn-primary">Birincil</button>
                <button className="btn btn-outline btn-secondary">İkincil</button>
                <button className="btn btn-outline btn-accent">Vurgu</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Özel Butonlar</h3>
              <div className="flex flex-wrap gap-2 my-4">
                <button className="btn btn-primary btn-wide">Geniş Buton</button>
                <button className="btn btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button className="btn btn-primary loading">Yükleniyor</button>
                <button className="btn btn-ghost">Hayalet</button>
                <button className="btn btn-link">Link Buton</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kartlar Bölümü */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Kartlar</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Basit Kart</h2>
              <p>Bu basit bir kart örneğidir. Sadece başlık ve açıklama içerir.</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <figure>
              <Image
                src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
                alt="Kart Resmi"
                width={400}
                height={225}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Resimli Kart</h2>
              <p>Bu kart üst kısımda bir resim içerir.</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <figure>
              <Image
                src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
                alt="Kart Resmi"
                width={400}
                height={225}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Alt Kısımlı Kart</h2>
              <p>Bu kart alt kısımda eylem butonları içerir.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Detaylar</button>
                <button className="btn btn-secondary btn-sm">Paylaş</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uyarılar Bölümü */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Uyarılar</h2>

        <div className="space-y-4">
          <div className="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Bu bir bilgi uyarısıdır.</span>
          </div>

          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>İşleminiz başarıyla tamamlandı!</span>
          </div>

          <div className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Uyarı: Bu işlem geri alınamaz.</span>
          </div>

          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Hata: Bir şeyler yanlış gitti. Lütfen tekrar deneyin.</span>
          </div>
        </div>
      </div>

      {/* Diğer Bileşenler */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Diğer Bileşenler</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Modal */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Modal Dialog</h3>
              <p>Modal dialog örneği için butona tıklayın.</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={() => {
                  const modal = document.getElementById('my_modal_1') as HTMLDialogElement;
                  if (modal) modal.showModal();
                }}>
                  Modal Aç
                </button>
                <dialog id="my_modal_1" className="modal">
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">Merhaba!</h3>
                    <p className="py-4">Bu bir DaisyUI modal dialog örneğidir.</p>
                    <div className="modal-action">
                      <form method="dialog">
                        <button className="btn">Kapat</button>
                      </form>
                    </div>
                  </div>
                </dialog>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Rozetler</h3>
              <div className="flex flex-wrap gap-2 my-4">
                <div className="badge">Varsayılan</div>
                <div className="badge badge-primary">Birincil</div>
                <div className="badge badge-secondary">İkincil</div>
                <div className="badge badge-accent">Vurgu</div>
                <div className="badge badge-outline">Çerçeveli</div>
                <div className="badge badge-lg">Büyük</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">İlerleme Çubukları</h3>
              <progress className="progress w-full my-2" value="0" max="100"></progress>
              <progress className="progress progress-primary w-full my-2" value="25" max="100"></progress>
              <progress className="progress progress-secondary w-full my-2" value="50" max="100"></progress>
              <progress className="progress progress-accent w-full my-2" value="75" max="100"></progress>
              <progress className="progress progress-success w-full my-2" value="100" max="100"></progress>
            </div>
          </div>

          {/* Toggle */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Anahtar ve Onay Kutuları</h3>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Hatırla</span>
                  <input type="checkbox" className="checkbox checkbox-primary" />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Karanlık Mod</span>
                  <input type="checkbox" className="toggle toggle-primary" />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Bildirimler</span>
                  <input type="radio" name="radio-10" className="radio radio-primary" checked />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
