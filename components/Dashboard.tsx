import React, { useState } from 'react';
import { analyzeImage, getSceneForCategory, generateProductImages } from '../services/geminiService';
import Spinner from './Spinner';
import { Session } from '@supabase/supabase-js';

interface ProcessStep {
    id: number;
    text: string;
    status: 'pending' | 'in-progress' | 'completed' | 'error';
}

interface DashboardProps {
    session: Session;
    onSignOut: () => void;
}


const adimlar: Omit<ProcessStep, 'status'>[] = [
    { id: 1, text: 'Yapay zeka ile ürün kategorisi analiz ediliyor...' },
    { id: 2, text: 'Mükemmel sahne oluşturuluyor...' },
    { id: 3, text: '4 benzersiz görsel oluşturuluyor... (Bu işlem biraz zaman alabilir)' },
];

const Dashboard: React.FC<DashboardProps> = ({ session, onSignOut }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 4 * 1024 * 1024) {
                 setError('Dosya boyutu 4MB\'den küçük olmalıdır.');
                 return;
            }
            setFile(selectedFile);
            setError(null);
            setGeneratedImages([]);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > 4 * 1024 * 1024) {
                 setError('Dosya boyutu 4MB\'den küçük olmalıdır.');
                 return;
            }
            setFile(droppedFile);
            setError(null);
            setGeneratedImages([]);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(droppedFile);
        }
    };

    const updateStepStatus = (stepId: number, status: ProcessStep['status'], errorMsg?: string) => {
        setProcessSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { ...step, status, text: errorMsg ? `${step.text} - ${errorMsg}` : step.text }
                : step
        ));
    };

    const handleGenerate = async () => {
        if (!file) {
            setError('Lütfen önce bir resim yükleyin.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setProcessSteps(adimlar.map(s => ({ ...s, status: 'pending' })));

        try {
            updateStepStatus(1, 'in-progress');
            const { category, description } = await analyzeImage(file);
            updateStepStatus(1, 'completed');

            updateStepStatus(2, 'in-progress');
            const scene = getSceneForCategory(category);
            updateStepStatus(2, 'completed');

            updateStepStatus(3, 'in-progress');
            const { images: base64Images } = await generateProductImages(description, scene);
            
            const imageUrls = base64Images.map(base64 => `data:image/jpeg;base64,${base64}`);
            setGeneratedImages(imageUrls);

            updateStepStatus(3, 'completed');

        } catch (err: any) {
            const errorMessage = err.message || 'Bilinmeyen bir hata oluştu.';
            setError(errorMessage);
            const currentStep = processSteps.find(s => s.status === 'in-progress');
            if (currentStep) {
                updateStepStatus(currentStep.id, 'error', errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
             <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                             <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456l1.178.398-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                            <span className="text-xl font-bold text-gray-900">AI Ürün Fotoğrafçısı</span>
                        </div>
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                                <span className="text-sm font-medium text-gray-600 hidden sm:block">{session.user.email}</span>
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                    <button onClick={onSignOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main className="p-4 sm:p-8">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                        Yapay Zeka ile Harika Ürün Fotoğrafları Oluşturun
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Ürün görselinizi yükleyin, yapay zekamız saniyeler içinde profesyonel ve yüksek kaliteli e-ticaret görselleri hazırlasın.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 flex flex-col items-center shadow-lg">
                            <label
                                htmlFor="file-upload"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className={`w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-indigo-500 bg-gray-50 transition-colors duration-300 ${preview ? 'p-2' : ''}`}
                            >
                                {preview ? (
                                    <img src={preview} alt="Önizleme" className="max-h-full max-w-full object-contain rounded-md" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <p className="mt-2">Bir resim sürükleyip bırakın veya seçmek için tıklayın</p>
                                        <p className="text-xs mt-1">PNG, JPG, WEBP - Maks. 4MB</p>
                                    </div>
                                )}
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                            
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !file}
                                className="mt-6 w-full max-w-xs bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                            >
                                {isLoading ? <Spinner /> : 'Görselleri Oluştur'}
                            </button>
                            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-lg">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">Oluşturulan Görseller</h3>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {processSteps.map(step => (
                                        <div key={step.id}>
                                            <div className="flex items-center gap-3 text-sm">
                                                {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0"></div>}
                                                {step.status === 'in-progress' && <Spinner small={true} />}
                                                {step.status === 'completed' && <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><span className="text-xs">✔</span></div>}
                                                {step.status === 'error' && <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">&times;</div>}
                                                <p className={`${step.status === 'error' ? 'text-red-500' : 'text-gray-600'}`}>{step.text.split(' - ')[0]}</p>
                                            </div>
                                            {step.id === 3 && step.status === 'in-progress' && (
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5 ml-7 overflow-hidden">
                                                    <div className="h-1.5 rounded-full shimmer-progress"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {error && <p className="text-red-500 mt-4 text-center bg-red-100 p-3 rounded-md border border-red-200">{error}</p>}
                                </div>
                            ) : generatedImages.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {generatedImages.map((img, index) => (
                                        <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden group relative">
                                            <img src={img} alt={`Oluşturulan görsel ${index + 1}`} className="w-full h-full object-cover" />
                                            <a href={img} download={`olusturulan-gorsel-${index + 1}.jpeg`} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="mt-4">Yapay zeka ile oluşturulan görselleriniz burada görünecek.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;