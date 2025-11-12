import React from 'react';

interface InitializationErrorProps {
  error: string;
}

const InitializationError: React.FC<InitializationErrorProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl p-8 border border-red-200">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eylem Gerekli: Uygulama Yapılandırması</h1>
            <p className="text-gray-600 mt-1">
              Bu bir kod hatası değil, beklenen bir kurulum adımıdır.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
          <p className="text-blue-800">
            Uygulamanın çalışabilmesi için veritabanı bağlantı bilgilerinize
            (Supabase) ihtiyacı var. Lütfen aşağıdaki adımları izleyerek bu
            bilgileri projenize ekleyin.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Yapılması Gerekenler:
        </h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700">
          <li>
            AI Studio projenizin sol menüsündeki anahtar (&#128273;) simgesine
            tıklayarak <strong>"Secrets"</strong> panelini açın.
          </li>
          <li>
            Aşağıdaki iki gizli anahtarı (secret) oluşturun:
            <div className="mt-3 space-y-3 pl-4">
              <div className="bg-gray-100 p-3 rounded-md border border-gray-200">
                <p className="font-semibold text-gray-800">1. Anahtar:</p>
                <p>
                  <strong>Ad (Name):</strong>{' '}
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
                    SUPABASE_URL
                  </code>
                </p>
                <p>
                  <strong>Değer (Value):</strong> Supabase projenizin URL'si
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md border border-gray-200">
                <p className="font-semibold text-gray-800">2. Anahtar:</p>
                <p>
                  <strong>Ad (Name):</strong>{' '}
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
                    SUPABASE_ANON_KEY
                  </code>
                </p>
                <p>
                  <strong>Değer (Value):</strong> Supabase projenizin{' '}
                  <strong>anon</strong> (public) anahtarı
                </p>
              </div>
            </div>
          </li>
          <li>
            Anahtarları kaydettikten sonra bu sayfayı <strong>yenileyin</strong>.
          </li>
        </ol>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p>
            <strong>Hata Mesajı:</strong> {error}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitializationError;
