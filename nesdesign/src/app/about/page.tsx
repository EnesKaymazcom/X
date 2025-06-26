import Image from 'next/image';

export const metadata = {
  title: 'Hakkımızda - NesDesign',
  description: 'NesDesign hakkında bilgi edinin. Vizyonumuz, misyonumuz ve değerlerimiz.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
        <div className="h-1 w-24 bg-primary mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Hikayemiz</h2>
          <p className="mb-4 text-base-content/80">
            NesDesign, 2020 yılında dijital tasarım dünyasında kaliteli ve erişilebilir içerikler sunmak amacıyla kuruldu. Başlangıçta küçük bir ekiple yola çıkan şirketimiz, bugün dünya genelinde binlerce tasarımcıya ve işletmeye hizmet vermektedir.
          </p>
          <p className="mb-4 text-base-content/80">
            Kurucumuz Mehmet Yılmaz, uzun yıllar boyunca grafik tasarım ve dijital pazarlama alanında çalıştıktan sonra, kaliteli dijital ürünlere erişimin zorluğunu fark etti ve NesDesign'ı kurarak bu alandaki boşluğu doldurmayı hedefledi.
          </p>
          <p className="text-base-content/80">
            Bugün, NesDesign olarak web tasarımdan mobil uygulamalara, grafik tasarımdan kullanıcı arayüzlerine kadar geniş bir yelpazede dijital ürünler sunuyoruz. Amacımız, müşterilerimizin projelerini en kısa sürede ve en yüksek kalitede hayata geçirmelerine yardımcı olmaktır.
          </p>
        </div>
        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="NesDesign Ekibi"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="bg-base-200 rounded-xl p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Vizyonumuz</h3>
              <p className="text-center text-base-content/80">
                Dijital tasarım dünyasında öncü olmak ve müşterilerimize en yenilikçi, kullanıcı dostu ve etkileyici tasarımları sunmak.
              </p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Misyonumuz</h3>
              <p className="text-center text-base-content/80">
                Her bütçeye uygun, yüksek kaliteli dijital ürünler sunarak müşterilerimizin projelerini bir üst seviyeye taşımalarına yardımcı olmak.
              </p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Değerlerimiz</h3>
              <p className="text-center text-base-content/80">
                Kalite, yenilikçilik, müşteri memnuniyeti ve sürekli gelişim bizim temel değerlerimizdir. Her projede bu değerleri ön planda tutuyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Ekibimiz</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="card bg-base-100 shadow-lg">
              <figure className="h-64 relative">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{member.name}</h3>
                <p className="text-primary font-medium">{member.position}</p>
                <p className="text-base-content/80 text-sm mt-2">{member.bio}</p>
                <div className="card-actions justify-center mt-4">
                  <div className="flex gap-2">
                    <a href="#" className="btn btn-circle btn-sm btn-outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                      </svg>
                    </a>
                    <a href="#" className="btn btn-circle btn-sm btn-outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                      </svg>
                    </a>
                    <a href="#" className="btn btn-circle btn-sm btn-outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-base-200 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Bizimle Çalışmak İster misiniz?</h2>
        <p className="max-w-2xl mx-auto mb-6 text-base-content/80">
          NesDesign olarak her zaman yetenekli ve tutkulu tasarımcılar, geliştiriciler ve pazarlama uzmanları arıyoruz. Ekibimize katılmak isterseniz, özgeçmişinizi bize gönderin.
        </p>
        <button className="btn btn-primary">
          Kariyer Fırsatları
        </button>
      </div>
    </div>
  );
}

const teamMembers = [
  {
    id: 1,
    name: 'Mehmet Yılmaz',
    position: 'Kurucu & CEO',
    bio: '10+ yıllık grafik tasarım ve dijital pazarlama deneyimine sahip. NesDesign\'ı 2020 yılında kurdu.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 2,
    name: 'Ayşe Kaya',
    position: 'Tasarım Direktörü',
    bio: 'Ödüllü bir UI/UX tasarımcısı. Kullanıcı odaklı tasarım yaklaşımıyla tanınıyor.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
  },
  {
    id: 3,
    name: 'Can Demir',
    position: 'Baş Geliştirici',
    bio: 'Full-stack geliştirici. Modern web teknolojileri konusunda uzman.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 4,
    name: 'Zeynep Şahin',
    position: 'Pazarlama Müdürü',
    bio: 'Dijital pazarlama stratejileri konusunda uzman. Veri odaklı pazarlama yaklaşımı benimsiyor.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80',
  },
];
